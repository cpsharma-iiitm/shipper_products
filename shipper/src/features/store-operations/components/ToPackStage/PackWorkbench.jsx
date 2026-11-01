import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Alert from '@/components/molecules/Alert'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import StatusBadge from '@/components/atoms/StatusBadge'
import { getErrorMessage } from '@/app/services'
import { formatShortDateTime } from '@/lib/date'
import { useMarkPacked } from '@/features/store-operations/hooks/useFulfilmentActions'
import { packSchema } from '@/features/store-operations/schemas/packSchema'
import PackageDetails from './PackageDetails'
import PackChecklist from './PackChecklist'
import styles from './PackWorkbench.module.scss'

const PARCEL_FIELDS = ['weightKg', 'length', 'width', 'height', 'packaging', 'packedBy']

/**
 * The packing bench for one order: contents checklist, parcel details and the buttons that finish it.
 * The checklist is a physical check kept on screen only; the parcel details and the three confirmations
 * are what the backend receives.
 */
export default function PackWorkbench({ order, queueSize, packers, packagingTypes, hasPrevious, onPrevious, onViewQueue, onPacked }) {
  const markPacked = useMarkPacked()
  const { suggested } = order.pack
  const [checked, setChecked] = useState([])
  const [attempted, setAttempted] = useState(false)
  const allChecked = order.lines.every((line) => checked.includes(line.productCode))

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(packSchema),
    defaultValues: {
      weightKg: suggested.weightKg,
      length: suggested.dimensionsCm.length,
      width: suggested.dimensionsCm.width,
      height: suggested.dimensionsCm.height,
      packaging: suggested.packaging,
      packedBy: suggested.packedBy,
      protectiveWrap: false,
      invoiceEnclosed: false,
      boxSealed: false,
    },
  })

  const submit = handleSubmit((values) => {
    if (!allChecked) return
    markPacked.mutate(
      {
        orderNumber: order.orderNumber,
        weightKg: values.weightKg,
        dimensionsCm: { length: values.length, width: values.width, height: values.height },
        packaging: values.packaging,
        packedBy: values.packedBy,
      },
      {
        onSuccess: () => {
          toast.success(`${order.orderNumber} packed and moved to Ready to Dispatch.`)
          onPacked()
        },
        onError: (error) => {
          const fieldErrors = Object.entries(error.details ?? {})
          if (fieldErrors.length === 0) toast.error(getErrorMessage(error))
          fieldErrors.forEach(([field, message]) => setError(PARCEL_FIELDS.includes(field) ? field : 'root', { message }))
        },
      },
    )
  })

  const handleFormSubmit = (event) => {
    setAttempted(true)
    return submit(event)
  }

  const toggleLine = (code) => setChecked((current) => (current.includes(code) ? current.filter((candidate) => candidate !== code) : [...current, code]))

  return (
    <form noValidate onSubmit={handleFormSubmit} className={styles.form} aria-label={`Pack order ${order.orderNumber}`}>
      <Card title={`Pack order #${order.orderNumber}`} padding="sm">
        <p className={styles.meta}>
          {order.customer.name} · Picked by {order.fulfilment.assignee}
          {order.timestamps.pickedAt && ` · ${formatShortDateTime(order.timestamps.pickedAt)}`}
        </p>
        <div className={styles.status}>
          <StatusBadge status="to_pack" />
          <Button variant="link" size="sm" onClick={onViewQueue}>
            {queueSize} {queueSize === 1 ? 'order' : 'orders'} in queue
          </Button>
        </div>
        {order.onHold && (
          <Alert tone="warning" className={styles.alert}>
            This order is on hold. Resolve the exception under Delayed Orders before packing it.
          </Alert>
        )}
        <PackChecklist order={order} checked={checked} onToggleLine={toggleLine} showError={attempted && !allChecked} />
      </Card>

      <PackageDetails register={register} control={control} errors={errors} packers={packers} packagingTypes={packagingTypes} />

      {errors.root && <Alert tone="danger">{errors.root.message}</Alert>}

      <div className={styles.actions}>
        <Button variant="secondary" size="md" leftIcon="arrow-left" disabled={!hasPrevious} onClick={onPrevious}>
          Previous order
        </Button>
        <Button type="submit" size="lg" rightIcon="arrow-right" loading={markPacked.isPending} disabled={order.onHold}>
          Mark Packed &amp; continue
        </Button>
      </div>
    </form>
  )
}
