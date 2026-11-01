import { Controller } from 'react-hook-form'
import Card from '@/components/atoms/Card'
import Checkbox from '@/components/atoms/Checkbox'
import Input from '@/components/atoms/Input'
import FormField from '@/components/molecules/FormField'
import SelectField from '@/components/molecules/SelectField'
import styles from './PackageDetails.module.scss'

const toOptions = (values) => values.map((value) => ({ value, label: value }))

/** Weight, dimensions, packaging and the three seal-up confirmations for the parcel. */
export default function PackageDetails({ register, control, errors, packers, packagingTypes }) {
  return (
    <Card title="Package details" padding="sm">
      <div className="row g-3">
        <div className="col-6 col-md-3">
          <FormField label="Weight (kg)" required error={errors.weightKg?.message}>
            {(field) => <Input {...field} type="number" inputMode="decimal" step="0.01" min="0" {...register('weightKg')} />}
          </FormField>
        </div>
        <div className="col-6 col-md-3">
          <FormField label="Length (cm)" error={errors.length?.message}>
            {(field) => <Input {...field} type="number" inputMode="decimal" step="0.1" min="0" {...register('length')} />}
          </FormField>
        </div>
        <div className="col-6 col-md-3">
          <FormField label="Width (cm)" error={errors.width?.message}>
            {(field) => <Input {...field} type="number" inputMode="decimal" step="0.1" min="0" {...register('width')} />}
          </FormField>
        </div>
        <div className="col-6 col-md-3">
          <FormField label="Height (cm)" error={errors.height?.message}>
            {(field) => <Input {...field} type="number" inputMode="decimal" step="0.1" min="0" {...register('height')} />}
          </FormField>
        </div>
        <div className="col-12 col-md-6">
          <FormField label="Packaging type" error={errors.packaging?.message}>
            {(field) => (
              <Controller
                name="packaging"
                control={control}
                render={({ field: packaging }) => <SelectField {...field} options={toOptions(packagingTypes)} value={packaging.value} onChange={packaging.onChange} />}
              />
            )}
          </FormField>
        </div>
        <div className="col-12 col-md-6">
          <FormField label="Packed by" error={errors.packedBy?.message}>
            {(field) => (
              <Controller
                name="packedBy"
                control={control}
                render={({ field: packedBy }) => <SelectField {...field} options={toOptions(packers)} value={packedBy.value} onChange={packedBy.onChange} />}
              />
            )}
          </FormField>
        </div>
      </div>
      <div className={styles.checks}>
        <FormField error={errors.protectiveWrap?.message}>
          {(field) => <Checkbox {...field} label="Protective wrap added" {...register('protectiveWrap')} />}
        </FormField>
        <FormField error={errors.invoiceEnclosed?.message}>
          {(field) => <Checkbox {...field} label="Invoice enclosed" {...register('invoiceEnclosed')} />}
        </FormField>
        <FormField error={errors.boxSealed?.message}>
          {(field) => <Checkbox {...field} label="Box sealed" {...register('boxSealed')} />}
        </FormField>
      </div>
    </Card>
  )
}
