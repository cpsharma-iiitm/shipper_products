import { zodResolver } from '@hookform/resolvers/zod'
import { State } from 'country-state-city'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Checkbox from '@/components/atoms/Checkbox'
import Input from '@/components/atoms/Input'
import Alert from '@/components/molecules/Alert'
import FormField from '@/components/molecules/FormField'
import SelectField from '@/components/molecules/SelectField'
import Drawer from '@/components/organisms/Drawer'
import { useSaveAddress } from '@/features/addresses/hooks/useAddresses'
import { addressSchema } from '@/features/addresses/schemas/addressSchema'
import { useServiceabilityCheck } from '@/features/storefront/hooks/useServiceabilityCheck'
import { formatMobile } from '@/lib/address'
import styles from './AddressDrawer.module.scss'

const STATE_OPTIONS = State.getStatesOfCountry('IN').map((state) => ({ value: state.name, label: state.name }))
const PIN_PATTERN = /^[1-9]\d{5}$/

const emptyAddress = (defaults) => ({
    label: '',
    name: defaults?.name ?? '',
    mobile: defaults?.mobile ?? '',
    line1: '',
    line2: '',
    landmark: '',
    city: '',
    pin: '',
    state: '',
    isDefault: false,
})

function AddressForm({ address, defaults, onClose, onSaved }) {
    const save = useSaveAddress()
    const serviceability = useServiceabilityCheck()
    const {
        register,
        control,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: address
            ? { ...address, mobile: formatMobile(address.mobile).replace('+91 ', ''), landmark: address.landmark ?? '' }
            : emptyAddress(defaults),
    })

    const pin = useWatch({ control, name: 'pin' })
    // A fresh answer for this exact PIN wins; otherwise an unchanged PIN keeps the saved address's status.
    const checked = serviceability.data && serviceability.data.pin === pin ? serviceability.data : null
    const deliveryAvailable = checked ? checked.serviceable : address && address.pin === pin ? address.verified : null

    // City and state are filled for a serviceable PIN the customer has not typed them for yet.
    const handlePinChange = (event) => {
        const value = event.target.value.trim()
        if (!PIN_PATTERN.test(value)) return
        serviceability.mutate(value, {
            onSuccess: (result) => {
                if (!result.serviceable) return
                if (!getValues('city')) setValue('city', result.city, { shouldValidate: true })
                if (!getValues('state')) setValue('state', result.state, { shouldValidate: true })
            },
        })
    }

    const onSubmit = handleSubmit((values) => {
        save.mutate(
            { ...values, id: address?.id },
            {
                onSuccess: (saved) => {
                    toast.success('Address saved.')
                    onSaved?.(saved)
                    onClose()
                },
                onError: (error) => toast.error(error.message || 'We could not save this address. Please try again.'),
            },
        )
    })

    return (
        <form id="address-form" className={styles.form} onSubmit={onSubmit} noValidate>
            {save.isError && <Alert tone="danger">{save.error.message}</Alert>}

            <FormField label="Address label" error={errors.label?.message}>
                {(field) => <Input {...field} {...register('label')} autoComplete="off" placeholder="Home, Office…" />}
            </FormField>

            <div className={styles.row}>
                <FormField label="Full name" error={errors.name?.message}>
                    {(field) => <Input {...field} {...register('name')} autoComplete="name" />}
                </FormField>
                <FormField label="Mobile" error={errors.mobile?.message}>
                    {(field) => <Input {...field} {...register('mobile')} inputMode="numeric" autoComplete="tel-national" />}
                </FormField>
            </div>

            <FormField label="House / flat / building" error={errors.line1?.message}>
                {(field) => <Input {...field} {...register('line1')} autoComplete="address-line1" />}
            </FormField>

            <FormField label="Street / area" error={errors.line2?.message}>
                {(field) => <Input {...field} {...register('line2')} autoComplete="address-line2" />}
            </FormField>

            <FormField label="Landmark (optional)" error={errors.landmark?.message}>
                {(field) => <Input {...field} {...register('landmark')} />}
            </FormField>

            <div className={styles.row}>
                <FormField label="City" error={errors.city?.message}>
                    {(field) => <Input {...field} {...register('city')} autoComplete="address-level2" />}
                </FormField>
                <FormField
                    label="PIN code"
                    error={errors.pin?.message ?? (deliveryAvailable === false ? 'We do not deliver to this PIN code yet.' : undefined)}
                    success={deliveryAvailable ? 'Delivery available' : undefined}
                >
                    {(field) => (
                        <Input {...field} {...register('pin', { onChange: handlePinChange })} inputMode="numeric" maxLength={6} autoComplete="postal-code" />
                    )}
                </FormField>
            </div>

            <FormField label="State" error={errors.state?.message}>
                {(field) => (
                    <Controller
                        control={control}
                        name="state"
                        render={({ field: { value, onChange } }) => (
                            <SelectField
                                id={field.id}
                                options={STATE_OPTIONS}
                                value={value}
                                onChange={onChange}
                                isSearchable
                                invalid={field.invalid}
                                placeholder="Select state"
                            />
                        )}
                    />
                )}
            </FormField>

            <Checkbox label="Set as default delivery address" {...register('isDefault')} />

            <div className={styles.actions}>
                <Button variant="secondary" size="lg" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" size="lg" loading={save.isPending}>
                    Save address
                </Button>
            </div>
        </form>
    )
}

/**
 * Add / edit address drawer, shared by the profile and checkout screens.
 *   address: the address being edited, or null to add a new one
 *   defaults: { name, mobile } pre-filled for a new address
 *   onSaved(address): called with the address returned by the backend
 * The form is rendered only while the drawer is open, so every opening starts from fresh values.
 */
export default function AddressDrawer({ open, onClose, address = null, defaults, onSaved }) {
    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={address ? 'Edit address' : 'Add new address'}
            description="Keep your delivery details up to date."
        >
            <AddressForm key={address?.id ?? 'new'} address={address} defaults={defaults} onClose={onClose} onSaved={onSaved} />
        </Drawer>
    )
}