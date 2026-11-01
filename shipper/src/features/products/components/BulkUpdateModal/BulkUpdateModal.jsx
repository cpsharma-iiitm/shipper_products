import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import Radio from '@/components/atoms/Radio'
import FormField from '@/components/molecules/FormField'
import SelectField from '@/components/molecules/SelectField'
import Modal from '@/components/organisms/Modal'
import { useBulkUpdateProducts, useProductOptions } from '@/features/products/hooks/useProducts'
import { bulkUpdateSchema } from '@/features/products/schemas/bulkUpdateSchema'
import { applyServerErrors } from '@/features/products/utils/applyServerErrors'
import { pluralize } from '@/lib/format'
import styles from './BulkUpdateModal.module.scss'

const STATUS_OPTIONS = [
  { value: '', label: 'No change' },
  { value: 'active', label: 'Set to Active' },
  { value: 'inactive', label: 'Set to Inactive' },
]

/**
 * Applies one change to many products at once: their status (show or hide on the storefront) and/or
 * their GST rate. The change targets either the ticked rows or every product matching the current
 * filters; the backend applies it. Mount it only while open.
 */
export default function BulkUpdateModal({ selectedCodes, matchingCount, filters, onClose, onUpdated }) {
  const formId = useId()
  const { data: options } = useProductOptions()
  const update = useBulkUpdateProducts()
  const hasSelection = selectedCodes.length > 0

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bulkUpdateSchema),
    defaultValues: { scope: hasSelection ? 'selected' : 'filtered', status: '', gstPercent: '' },
  })

  const [scope, status, gstPercent] = useWatch({ control, name: ['scope', 'status', 'gstPercent'] })
  const targetCount = scope === 'selected' ? selectedCodes.length : matchingCount

  const gstOptions = [{ value: '', label: 'No change' }, ...(options?.gstRates ?? []).map((rate) => ({ value: rate, label: `${rate}%` }))]

  const changeSummary = [
    status && `status to ${status === 'active' ? 'Active' : 'Inactive'}`,
    gstPercent !== '' && `GST rate to ${gstPercent}%`,
  ].filter(Boolean)

  const onSubmit = (values) => {
    const changes = {}
    if (values.status) changes.status = values.status
    if (values.gstPercent !== '') changes.gstPercent = values.gstPercent
    update.mutate(
      { scope: values.scope === 'selected' ? { codes: selectedCodes } : { filters }, changes },
      {
        onSuccess: ({ updated }) => {
          toast.success(`${pluralize(updated, 'product')} updated.`)
          onUpdated()
          onClose()
        },
        onError: (error) => {
          if (!applyServerErrors(error, setError)) toast.error(getErrorMessage(error))
        },
      },
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title="Bulk update"
      description="Change the status or GST rate of several products at once."
      closeOnBackdrop={!update.isPending}
      footer={
        <>
          <Button variant="secondary" disabled={update.isPending} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={update.isPending} disabled={targetCount === 0}>
            Apply to {pluralize(targetCount, 'product')}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <fieldset className={styles.scope}>
          <legend className={styles.legend}>Products to update</legend>
          {hasSelection && <Radio {...register('scope')} value="selected" label={`The ${pluralize(selectedCodes.length, 'selected product')}`} />}
          <Radio
            {...register('scope')}
            value="filtered"
            label={`All ${pluralize(matchingCount, 'product')} matching the current filters`}
          />
        </fieldset>

        <FormField label="Status" error={errors.status?.message}>
          {(field) => (
            <Controller
              name="status"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SelectField id={field.id} invalid={field.invalid} options={STATUS_OPTIONS} value={value} onChange={onChange} />
              )}
            />
          )}
        </FormField>

        <FormField label="GST rate" hint="Prices stay GST-inclusive; only the tax portion changes.">
          {(field) => (
            <Controller
              name="gstPercent"
              control={control}
              render={({ field: { value, onChange } }) => <SelectField id={field.id} options={gstOptions} value={value} onChange={onChange} />}
            />
          )}
        </FormField>

        {changeSummary.length > 0 && (
          <p className={styles.summary}>
            This will set {changeSummary.join(' and ')} for {pluralize(targetCount, 'product')}.
          </p>
        )}
      </form>
    </Modal>
  )
}
