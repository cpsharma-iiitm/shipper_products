import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Skeleton from '@/components/atoms/Skeleton'
import Alert from '@/components/molecules/Alert'
import ErrorState from '@/components/molecules/ErrorState'
import FormField from '@/components/molecules/FormField'
import SelectField from '@/components/molecules/SelectField'
import Modal from '@/components/organisms/Modal'
import { getErrorMessage } from '@/app/services'
import { reportBulkResult } from '@/features/store-operations/utils/bulkResult'
import { useDispatchOrders } from '@/features/store-operations/hooks/useFulfilmentActions'
import { useStageQueue, useStoreOptions } from '@/features/store-operations/hooks/useStoreOperations'
import { manifestSchema } from '@/features/store-operations/schemas/dispatchSchema'
import { formatParcelWeight } from '@/features/store-operations/utils/formatParcel'
import styles from './DispatchManifestModal.module.scss'

const FORM_ID = 'dispatch-manifest-form'
// Every order waiting for dispatch; at most 50 are shown in one manifest.
const MANIFEST_QUERY = { stage: 'ready', page: 1, pageSize: 50 }

function ManifestForm({ rows, options, mutation, onClose, onDone }) {
  const carrier = options.carriers[0]
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(manifestSchema),
    defaultValues: {
      service: carrier?.services[0] ?? 'Speed Post',
      dispatchDate: options.today,
      entries: rows.map((row) => ({ orderNumber: row.orderNumber, consignmentId: '' })),
    },
  })
  const { fields, remove } = useFieldArray({ control, name: 'entries' })

  const submit = handleSubmit(({ service, dispatchDate, entries }) => {
    const filled = entries.map((entry, index) => ({ ...entry, index })).filter((entry) => entry.consignmentId)
    mutation.mutate(
      filled.map(({ orderNumber, consignmentId }) => ({ orderNumber, consignmentId, service, dispatchDate, carrier: carrier?.value })),
      {
        onSuccess: (result) => {
          reportBulkResult(result, { done: 'dispatched' })
          if (result.failed.length === 0) {
            onClose()
            onDone()
            return
          }
          // Keep the refused orders on screen with the reason; the dispatched ones are done.
          const failedByOrder = new Map(result.failed.map((failure) => [failure.orderNumber, failure.reason]))
          result.succeeded
            .map((orderNumber) => filled.find((entry) => entry.orderNumber === orderNumber).index)
            .sort((a, b) => b - a)
            .forEach(remove)
          const remaining = entries.filter((entry) => !result.succeeded.includes(entry.orderNumber))
          remaining.forEach((entry, index) => {
            if (failedByOrder.has(entry.orderNumber)) setError(`entries.${index}.consignmentId`, { message: failedByOrder.get(entry.orderNumber) })
          })
        },
      },
    )
  })

  return (
    <form id={FORM_ID} noValidate onSubmit={submit} className={styles.form}>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <FormField label="Service" required error={errors.service?.message}>
            {(field) => (
              <Controller
                name="service"
                control={control}
                render={({ field: service }) => (
                  <SelectField {...field} options={(carrier?.services ?? []).map((value) => ({ value, label: value }))} value={service.value} onChange={service.onChange} />
                )}
              />
            )}
          </FormField>
        </div>
        <div className="col-12 col-md-6">
          <FormField label="Dispatch date" required error={errors.dispatchDate?.message}>
            {(field) => <Input {...field} type="date" max={options.today} {...register('dispatchDate')} />}
          </FormField>
        </div>
      </div>

      <p className={styles.hint}>Enter the India Post consignment ID of each parcel handed over. Orders left blank stay in the queue.</p>
      {errors.entries?.message && <Alert tone="danger">{errors.entries.message}</Alert>}

      <table className={styles.table}>
        <caption className="visually-hidden">Orders in this dispatch manifest</caption>
        <thead>
          <tr>
            <th scope="col">Order / customer</th>
            <th scope="col">Weight</th>
            <th scope="col">Consignment ID</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => {
            const row = rows.find((candidate) => candidate.orderNumber === field.orderNumber)
            return (
              <tr key={field.id}>
                <td>
                  {row.orderNumber} · {row.customerName}
                </td>
                <td>{formatParcelWeight(row.weightKg)}</td>
                <td>
                  <FormField error={errors.entries?.[index]?.consignmentId?.message}>
                    {(input) => (
                      <Input
                        {...input}
                        size="md"
                        aria-label={`Consignment ID for ${row.orderNumber}`}
                        placeholder="EU483920218IN"
                        autoComplete="off"
                        spellCheck={false}
                        {...register(`entries.${index}.consignmentId`)}
                      />
                    )}
                  </FormField>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </form>
  )
}

/**
 * Create dispatch manifest: assign India Post consignment IDs to several packed orders at once and hand
 * them over together. Limited to the checked orders when any are checked, otherwise every packed order.
 */
export default function DispatchManifestModal({ open, onClose, selectedOrderNumbers, onDone }) {
  const options = useStoreOptions()
  const queue = useStageQueue(MANIFEST_QUERY, { enabled: open })
  const mutation = useDispatchOrders()

  const rows = (queue.data?.items ?? []).filter((row) => !row.onHold && (selectedOrderNumbers.length === 0 || selectedOrderNumbers.includes(row.orderNumber)))
  const ready = Boolean(queue.data && options.data)

  let body = (
    <div className={styles.loading} role="status" aria-label="Loading orders">
      <Skeleton height="2.75rem" />
      <Skeleton height="2.75rem" />
      <Skeleton height="2.75rem" />
    </div>
  )
  if (queue.isError || options.isError) {
    body = <ErrorState compact message={getErrorMessage(queue.error ?? options.error)} onRetry={queue.refetch} />
  } else if (ready && rows.length === 0) {
    body = <Alert tone="info">There are no packed orders that can be dispatched right now.</Alert>
  } else if (ready) {
    body = <ManifestForm rows={rows} options={options.data} mutation={mutation} onClose={onClose} onDone={onDone} />
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Create dispatch manifest"
      description="Hand a batch of packed parcels to India Post in one go."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={mutation.isPending} disabled={!ready || rows.length === 0}>
            Mark dispatched
          </Button>
        </>
      }
    >
      {body}
    </Modal>
  )
}
