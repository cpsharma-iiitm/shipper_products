import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Input from '@/components/atoms/Input'
import Alert from '@/components/molecules/Alert'
import FormField from '@/components/molecules/FormField'
import Tabs, { TabPanel } from '@/components/molecules/Tabs'
import { TRACKING_MODES, trackingSchema } from '@/features/tracking/schemas/trackingSchema'
import styles from './TrackShipmentForm.module.scss'

const TABS_ID = 'track-mode'

const toPayload = (values) =>
  values.mode === 'order' ? { orderNumber: values.orderNumber, mobile: values.mobile } : { consignmentId: values.consignmentId }

/**
 * Lookup form: an order number with the mobile number on the order, or a consignment ID on its own.
 *   onSubmit(payload): { orderNumber, mobile } | { consignmentId }, already trimmed and normalised
 *   error: the failed lookup's ApiError, shown above the button
 */
export default function TrackShipmentForm({ onSubmit, isPending = false, error, defaultMobile = '' }) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(trackingSchema),
    defaultValues: { mode: 'order', orderNumber: '', mobile: defaultMobile, consignmentId: '' },
  })
  const mode = useWatch({ control, name: 'mode' })

  const changeMode = (next) => {
    setValue('mode', next)
    clearErrors()
  }

  return (
    <Card title="Find your parcel" padding="lg">
      <form className={styles.form} onSubmit={handleSubmit((values) => onSubmit(toPayload(values)))} noValidate>
        <Tabs id={TABS_ID} variant="pill" label="Look up by" items={TRACKING_MODES} value={mode} onChange={changeMode} />

        <TabPanel id={TABS_ID} tabKey="order" value={mode} className={styles.panel}>
          <FormField label="Order number" error={errors.orderNumber?.message} hint="It’s in your order confirmation, for example SH10482.">
            {(field) => <Input {...field} {...register('orderNumber')} placeholder="SH10482" autoComplete="off" autoCapitalize="characters" />}
          </FormField>
          <FormField label="Mobile number" error={errors.mobile?.message} hint="The number you used when you placed the order.">
            {(field) => <Input {...field} {...register('mobile')} inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" />}
          </FormField>
        </TabPanel>

        <TabPanel id={TABS_ID} tabKey="consignment" value={mode} className={styles.panel}>
          <FormField label="Consignment ID" error={errors.consignmentId?.message} hint="Printed on your dispatch update, for example EU483920175IN.">
            {(field) => <Input {...field} {...register('consignmentId')} placeholder="EU483920175IN" autoComplete="off" autoCapitalize="characters" />}
          </FormField>
        </TabPanel>

        {error && <Alert tone="danger">{error.message}</Alert>}

        <Button type="submit" size="lg" loading={isPending} leftIcon="search">
          Track shipment
        </Button>
      </form>
    </Card>
  )
}
