import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import FormField from '@/components/molecules/FormField'
import SelectField from '@/components/molecules/SelectField'
import Modal from '@/components/organisms/Modal'
import { getErrorMessage } from '@/app/services'
import { useReportStockException } from '@/features/store-operations/hooks/useFulfilmentActions'
import { createDiscrepancySchema } from '@/features/store-operations/schemas/discrepancySchema'

const FORM_ID = 'stock-discrepancy-form'

function DiscrepancyForm({ order, mutation, onClose }) {
  const schema = useMemo(() => createDiscrepancySchema(order.lines), [order.lines])
  const shortLine = order.lines.find((line) => line.available < line.quantity) ?? order.lines[0]
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { productCode: shortLine.productCode, availableQuantity: '', note: '' } })

  const submit = handleSubmit((values) =>
    mutation.mutate(
      { orderNumber: order.orderNumber, ...values },
      {
        onSuccess: () => {
          toast.success(`${order.orderNumber} is on hold and listed under Delayed Orders.`)
          onClose()
        },
        onError: (error) => {
          const fieldErrors = Object.entries(error.details ?? {})
          if (fieldErrors.length === 0) toast.error(getErrorMessage(error))
          fieldErrors.forEach(([field, message]) => setError(field, { message }))
        },
      },
    ),
  )

  return (
    <form id={FORM_ID} noValidate onSubmit={submit} className="d-flex flex-column gap-3">
      <FormField label="Product" required error={errors.productCode?.message}>
        {(field) => (
          <Controller
            name="productCode"
            control={control}
            render={({ field: product }) => (
              <SelectField
                {...field}
                options={order.lines.map((line) => ({ value: line.productCode, label: `${line.productCode} · ${line.name} (requested ${line.quantity})` }))}
                value={product.value}
                onChange={product.onChange}
              />
            )}
          />
        )}
      </FormField>
      <FormField label="Quantity found in the bin" required error={errors.availableQuantity?.message}>
        {(field) => <Input {...field} type="number" inputMode="numeric" min="0" {...register('availableQuantity')} />}
      </FormField>
      <FormField label="Note" error={errors.note?.message}>
        {(field) => <Input {...field} placeholder="What did you see on the shelf?" autoComplete="off" {...register('note')} />}
      </FormField>
    </form>
  )
}

/** Short-pick report: records what was actually found, holds the order and sends it to Delayed Orders. */
export default function DiscrepancyModal({ open, onClose, order }) {
  const mutation = useReportStockException()

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Report stock discrepancy"
      description={`${order.orderNumber} is put on hold and moved to Delayed Orders until the stock is sorted out.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Report and hold order
          </Button>
        </>
      }
    >
      <DiscrepancyForm key={order.orderNumber} order={order} mutation={mutation} onClose={onClose} />
    </Modal>
  )
}
