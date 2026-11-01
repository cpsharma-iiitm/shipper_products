import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Checkbox from '@/components/atoms/Checkbox'
import Input from '@/components/atoms/Input'
import FormField from '@/components/molecules/FormField'
import SelectField from '@/components/molecules/SelectField'
import ConfirmDialog from '@/components/organisms/ConfirmDialog'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import { useDisclosure } from '@/hooks/useDisclosure'
import { formatINR, pluralize } from '@/lib/format'
import { DELAY_ACTIONS, findIssueGroup } from '@/features/store-operations/config/delays'
import WorkPanel, { PanelNote, PanelSection } from '@/features/store-operations/components/WorkPanel'
import { useResolveDelay, useSaveResolution } from '@/features/store-operations/hooks/useFulfilmentActions'
import { useStoreOptions, useWorkOrder } from '@/features/store-operations/hooks/useStoreOperations'
import { resolutionSchema } from '@/features/store-operations/schemas/resolutionSchema'
import { fromDateTimeInput, toDateTimeInput } from '@/features/store-operations/utils/dateInput'
import styles from './ResolvePanel.module.scss'

const ACTION_OPTIONS = DELAY_ACTIONS.map(({ value, label }) => ({ value, label }))

/** The two lines under the badge: what was paid for, and what exactly is wrong. */
function IssueSummary({ order }) {
  const { payment, delay, stock, lines } = order
  const shortage = delay.issue === 'stock_shortage' ? stock.shortages[0] : null
  const paid = payment.status === 'paid' ? `Paid ${formatINR(payment.paid)}` : `Payment ${payment.status}`

  return (
    <>
      <p className={styles.customer}>
        {order.customer.name} · {order.address.city} {order.address.pin}
      </p>
      <PanelNote>{shortage ? `${paid} · ${shortage.productCode} ${shortage.name}` : `${paid} · ${pluralize(lines.length, 'product')}`}</PanelNote>
      <p className={styles.detail}>
        {shortage ? `Requested ${shortage.requested} · Available ${shortage.available} · Shortage ${pluralize(shortage.shortage, 'unit')}` : delay.detail}
      </p>
    </>
  )
}

function ResolveForm({ order, owners, onDone }) {
  const { delay } = order
  const save = useSaveResolution()
  const resolve = useResolveDelay()
  const confirm = useDisclosure()
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resolutionSchema),
    defaultValues: {
      owner: delay.owner,
      action: delay.action,
      expectedResolutionAt: toDateTimeInput(delay.expectedResolutionAt),
      note: delay.note,
      notifyCustomer: true,
    },
  })

  const submit = handleSubmit((values) =>
    save.mutate(
      { orderNumber: order.orderNumber, ...values, expectedResolutionAt: fromDateTimeInput(values.expectedResolutionAt) },
      {
        onSuccess: () => {
          toast.success(values.notifyCustomer ? `Resolution saved for ${order.orderNumber}. The customer has been notified.` : `Resolution saved for ${order.orderNumber}.`)
          reset(values)
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    ),
  )

  const markResolved = () =>
    resolve.mutate(order.orderNumber, {
      onSuccess: () => {
        toast.success(`${order.orderNumber} resolved. It is back in its queue.`)
        confirm.close()
        onDone()
      },
      onError: (error) => {
        confirm.close()
        toast.error(getErrorMessage(error))
      },
    })

  return (
    <form noValidate onSubmit={submit} className={styles.form}>
      <div className="row g-3">
        <div className="col-6">
          <FormField label="Resolution owner" error={errors.owner?.message}>
            {(field) => (
              <Controller
                name="owner"
                control={control}
                render={({ field: owner }) => (
                  <SelectField {...field} options={owners.map((name) => ({ value: name, label: name }))} value={owner.value} onChange={owner.onChange} />
                )}
              />
            )}
          </FormField>
        </div>
        <div className="col-6">
          <FormField label="Action" error={errors.action?.message}>
            {(field) => (
              <Controller
                name="action"
                control={control}
                render={({ field: action }) => <SelectField {...field} options={ACTION_OPTIONS} value={action.value} onChange={action.onChange} />}
              />
            )}
          </FormField>
        </div>
      </div>

      <FormField label="Expected resolution" error={errors.expectedResolutionAt?.message}>
        {(field) => <Input {...field} type="datetime-local" {...register('expectedResolutionAt')} />}
      </FormField>

      <FormField label="Internal note" error={errors.note?.message}>
        {(field) => <Input {...field} placeholder="Add a note for the team" autoComplete="off" {...register('note')} />}
      </FormField>

      <Checkbox label="Notify customer about revised timeline" {...register('notifyCustomer')} />

      <div className={styles.actions}>
        <Button type="submit" size="lg" loading={save.isPending}>
          Save resolution &amp; assign
        </Button>
        <Button variant="secondary" size="lg" onClick={confirm.open}>
          Mark as resolved
        </Button>
      </div>
      {order.delay.group === 'stock' && (
        <Link className={styles.link} to={paths.admin.restock}>
          Create restock request <i className="bi bi-arrow-right" aria-hidden="true" />
        </Link>
      )}

      <ConfirmDialog
        open={confirm.isOpen}
        onClose={confirm.close}
        onConfirm={markResolved}
        loading={resolve.isPending}
        title={`Mark ${order.orderNumber} as resolved?`}
        message={
          delay.issue === 'stock_shortage'
            ? 'The restock is taken to have arrived. The delay is cleared and the order goes back to its queue.'
            : 'The delay is cleared and the order goes back to its queue.'
        }
        confirmLabel="Mark as resolved"
      />
    </form>
  )
}

/** The Resolve panel: owner, action, schedule and note for one delayed order, plus closing the exception. */
export default function ResolvePanel({ orderNumber, onDone }) {
  const query = useWorkOrder(orderNumber)
  const options = useStoreOptions()

  return (
    <WorkPanel
      title={orderNumber ? `Resolve #${orderNumber}` : 'Resolve order'}
      orderNumber={orderNumber}
      query={query}
      emptyTitle="Select a delayed order"
      emptyDescription="Choose an order from the exception queue to resolve it."
    >
      {(order) => {
        if (!order.delay) {
          return <PanelNote>This order no longer has an open exception.</PanelNote>
        }
        const group = findIssueGroup(order.delay.group)
        return (
          <>
            <PanelSection>
              <Badge tone={group.badgeTone} className="align-self-start">
                {group.badgeLabel} · {order.delay.ageHours}h
              </Badge>
              <IssueSummary order={order} />
            </PanelSection>
            <PanelSection divided className={styles.formSection}>
              {/* Keyed so choosing another order, or another exception on the same order, starts a fresh form. */}
              <ResolveForm key={`${order.orderNumber}:${order.delay.issue}`} order={order} owners={options.data?.owners ?? []} onDone={onDone} />
            </PanelSection>
          </>
        )
      }}
    </WorkPanel>
  )
}
