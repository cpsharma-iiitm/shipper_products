import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Checkbox from '@/components/atoms/Checkbox'
import Input from '@/components/atoms/Input'
import StatusBadge from '@/components/atoms/StatusBadge'
import Alert from '@/components/molecules/Alert'
import FormField from '@/components/molecules/FormField'
import SelectField from '@/components/molecules/SelectField'
import { getErrorMessage } from '@/app/services'
import { CONSIGNMENT_ID_PATTERN } from '@/lib/validation'
import WorkPanel, { PanelNote, PanelSection } from '@/features/store-operations/components/WorkPanel'
import { useDispatchOrder } from '@/features/store-operations/hooks/useFulfilmentActions'
import { useStoreOptions, useWorkOrder } from '@/features/store-operations/hooks/useStoreOperations'
import { dispatchSchema } from '@/features/store-operations/schemas/dispatchSchema'
import { formatDimensions, formatParcelWeight } from '@/features/store-operations/utils/formatParcel'
import styles from './DispatchPanel.module.scss'

const toOptions = (values = []) => values.map((value) => ({ value, label: value }))

function DispatchForm({ order, carriers, onDone }) {
  const dispatch = useDispatchOrder()
  const defaultCarrier = carriers[0]
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dispatchSchema),
    defaultValues: {
      carrier: defaultCarrier?.value ?? 'India Post',
      service: defaultCarrier?.services[0] ?? 'Speed Post',
      consignmentId: '',
      dispatchDate: order.dispatch.suggestedDate,
      documentsAttached: false,
      weightVerified: false,
    },
  })

  const [carrierValue, consignmentId] = useWatch({ control, name: ['carrier', 'consignmentId'] })
  const carrier = carriers.find((candidate) => candidate.value === carrierValue)
  const looksValid = CONSIGNMENT_ID_PATTERN.test(consignmentId.trim().toUpperCase())

  const submit = handleSubmit((values) =>
    dispatch.mutate(
      {
        orderNumber: order.orderNumber,
        carrier: values.carrier,
        service: values.service,
        consignmentId: values.consignmentId,
        dispatchDate: values.dispatchDate,
      },
      {
        onSuccess: () => {
          toast.success(`${order.orderNumber} dispatched with ${values.consignmentId}.`)
          onDone()
        },
        onError: (error) => {
          const fieldErrors = Object.entries(error.details ?? {})
          if (fieldErrors.length === 0) {
            toast.error(getErrorMessage(error))
            return
          }
          fieldErrors.forEach(([field, message]) => setError(field, { message }))
        },
      },
    ),
  )

  return (
    <form noValidate onSubmit={submit} className={styles.form}>
      <div className="row g-3">
        <div className="col-6">
          <FormField label="Carrier" required error={errors.carrier?.message}>
            {(control_) => (
              <Controller
                name="carrier"
                control={control}
                render={({ field }) => (
                  <SelectField
                    {...control_}
                    options={carriers.map(({ value, label }) => ({ value, label }))}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value)
                      setValue('service', carriers.find((candidate) => candidate.value === value)?.services[0] ?? '')
                    }}
                  />
                )}
              />
            )}
          </FormField>
        </div>
        <div className="col-6">
          <FormField label="Service" required error={errors.service?.message}>
            {(control_) => (
              <Controller
                name="service"
                control={control}
                render={({ field }) => <SelectField {...control_} options={toOptions(carrier?.services)} value={field.value} onChange={field.onChange} />}
              />
            )}
          </FormField>
        </div>
      </div>

      <FormField
        label="Consignment / tracking ID"
        required
        error={errors.consignmentId?.message}
        hint="2 letters, 9 digits, IN. For example EU483920218IN."
        success={looksValid ? 'Valid format: 2 letters, 9 digits, IN' : undefined}
      >
        {(control_) => <Input {...control_} {...register('consignmentId')} autoComplete="off" spellCheck={false} placeholder="EU483920218IN" />}
      </FormField>

      <FormField label="Dispatch date" required error={errors.dispatchDate?.message}>
        {(control_) => <Input {...control_} type="date" max={order.dispatch.suggestedDate} {...register('dispatchDate')} />}
      </FormField>

      <div className={styles.checks}>
        <FormField error={errors.documentsAttached?.message}>
          {(control_) => <Checkbox {...control_} label="Invoice printed & label attached" {...register('documentsAttached')} />}
        </FormField>
        <FormField error={errors.weightVerified?.message}>
          {(control_) => <Checkbox {...control_} label="Weight verified against manifest" {...register('weightVerified')} />}
        </FormField>
      </div>

      <Button type="submit" size="lg" rightIcon="arrow-right" loading={dispatch.isPending} disabled={order.onHold} className={styles.submit}>
        Confirm dispatch handoff
      </Button>
      <PanelNote>Customer receives a shipment update once the handoff is confirmed.</PanelNote>
    </form>
  )
}

/** The Assign tracking panel: carrier, service, consignment ID and handoff checks for one packed order. */
export default function DispatchPanel({ orderNumber, onDone }) {
  const query = useWorkOrder(orderNumber)
  const options = useStoreOptions()

  return (
    <WorkPanel
      title={orderNumber ? `Assign tracking · #${orderNumber}` : 'Assign tracking'}
      orderNumber={orderNumber}
      query={query}
      emptyTitle="Select a packed order"
      emptyDescription="Choose an order from the queue to assign its India Post tracking ID."
    >
      {(order) => (
        <>
          <PanelSection>
            <StatusBadge status="packed" label="Packed · Ready for handoff" className="align-self-start" />
            <p className={styles.customer}>
              {order.customer.name} · {order.address.city} {order.address.pin}
            </p>
            {order.pack.recorded && (
              <PanelNote>
                Package: {formatParcelWeight(order.pack.recorded.weightKg)} · {formatDimensions(order.pack.recorded.dimensionsCm)}
              </PanelNote>
            )}
            {order.onHold && <Alert tone="warning">This order is on hold. Resolve the exception under Delayed Orders before dispatching it.</Alert>}
          </PanelSection>
          <PanelSection divided className={styles.formSection}>
            <DispatchForm key={order.orderNumber} order={order} carriers={options.data?.carriers ?? []} onDone={onDone} />
          </PanelSection>
        </>
      )}
    </WorkPanel>
  )
}
