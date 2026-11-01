import { useId, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/app/services'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import FormField from '@/components/molecules/FormField'
import SelectField from '@/components/molecules/SelectField'
import Modal from '@/components/organisms/Modal'
import { useProductOptions, useSaveProduct } from '@/features/products/hooks/useProducts'
import { emptyProductValues, productSchema, toProductFormValues } from '@/features/products/schemas/productSchema'
import { applyServerErrors } from '@/features/products/utils/applyServerErrors'
import { formatDate } from '@/lib/date'
import { formatPercent, pluralize } from '@/lib/format'
import ProductImageField from './ProductImageField'
import styles from './ProductFormModal.module.scss'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const toOptions = (values, format = String) => values.map((value) => ({ value, label: format(value) }))

/**
 * Add Product / Edit Product dialog. Mount it only while open (pass `product` to edit, nothing to add)
 * so the form starts from the right values. Prices are entered as typed; the backend returns the
 * saved product including the discount it calculated.
 */
export default function ProductFormModal({ product = null, onClose }) {
  const formId = useId()
  const isEditing = Boolean(product)
  const [imageFile, setImageFile] = useState(null)
  const { data: options, isPending: optionsPending } = useProductOptions()
  const save = useSaveProduct()

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product ? toProductFormValues(product) : emptyProductValues,
    mode: 'onTouched',
  })

  const errorCount = Object.keys(errors).length
  const status = useWatch({ control, name: 'status' })

  // A product's own pack size stays selectable even if it is not in the backend's standard list.
  const unitValues = options ? [...new Set([...(product ? [product.unit] : []), ...options.units])] : []

  const onSubmit = (values) => {
    save.mutate(
      { code: product?.code, values, imageFile },
      {
        onSuccess: ({ product: saved, imageError }) => {
          toast.success(`${saved.name} ${isEditing ? 'saved' : 'added'}. Discount on the storefront: ${formatPercent(saved.discountPercent)}.`)
          if (imageError) toast.warning(`The product was saved, but its image was not uploaded: ${getErrorMessage(imageError)}`)
          onClose()
        },
        onError: (error) => {
          if (error.status === 409 && !applyServerErrors(error, setError)) setError('code', { type: 'server', message: error.message })
          else if (!applyServerErrors(error, setError)) toast.error(getErrorMessage(error))
        },
      },
    )
  }

  const selectField = (name, label, selectOptions, extra = {}) => (
    <FormField label={label} required error={errors[name]?.message}>
      {(field) => (
        <Controller
          name={name}
          control={control}
          render={({ field: { value, onChange } }) => (
            <SelectField
              id={field.id}
              invalid={field.invalid}
              aria-invalid={field['aria-invalid']}
              options={selectOptions}
              value={value}
              onChange={onChange}
              isLoading={optionsPending}
              placeholder="Select"
              {...extra}
            />
          )}
        />
      )}
    </FormField>
  )

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={isEditing ? 'Edit Product' : 'Add Product'}
      description={
        isEditing
          ? `${product.code} · Last updated ${formatDate(product.updatedAt)} by ${product.updatedBy}`
          : 'Create a catalogue item. Prices include GST.'
      }
      closeOnBackdrop={!save.isPending}
      footer={
        <>
          {errorCount > 0 && (
            <p role="alert" className={styles.summary}>
              {errorCount === 1 ? '1 field needs' : `${errorCount} fields need`} attention before saving.
            </p>
          )}
          <Button variant="secondary" size="lg" disabled={save.isPending} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} size="lg" loading={save.isPending}>
            {isEditing ? 'Save changes' : 'Add product'}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit(onSubmit)} className={styles.layout}>
        <aside className={styles.side}>
          <ProductImageField src={product?.image} alt={product ? `${product.name} photo` : 'Product photo preview'} onChange={setImageFile} />
          <FormField label="Product status">
            {(field) => (
              <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <SelectField id={field.id} options={STATUS_OPTIONS} value={value} onChange={onChange} />
                )}
              />
            )}
          </FormField>
          <Badge tone={status === 'active' ? 'success' : 'neutral'} className={styles.visibility}>
            {status === 'active' ? 'Visible on storefront' : 'Hidden from storefront'}
          </Badge>
        </aside>

        <div className={styles.main}>
          <section aria-labelledby={`${formId}-identity`}>
            <h3 id={`${formId}-identity`} className={styles.sectionTitle}>
              Identity &amp; classification
            </h3>
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <FormField label="Product code" required error={errors.code?.message} hint={isEditing ? 'The code cannot be changed.' : undefined}>
                  {(field) => (
                    <Input
                      {...field}
                      {...register('code')}
                      readOnly={isEditing}
                      variant={isEditing ? 'filled' : 'outline'}
                      autoCapitalize="characters"
                      autoComplete="off"
                    />
                  )}
                </FormField>
              </div>
              <div className="col-12 col-sm-6">{selectField('category', 'Category', options?.categories ?? [], { isSearchable: false })}</div>
              <div className="col-12">
                <FormField label="Product name" required error={errors.name?.message}>
                  {(field) => <Input {...field} {...register('name')} autoComplete="off" />}
                </FormField>
              </div>
              <div className="col-12 col-sm-6">
                <FormField label="Batch" required error={errors.batch?.message}>
                  {(field) => <Input {...field} {...register('batch')} autoComplete="off" />}
                </FormField>
              </div>
              <div className="col-12 col-sm-6">
                <FormField label="HSN code" required error={errors.hsn?.message}>
                  {(field) => <Input {...field} {...register('hsn')} inputMode="numeric" autoComplete="off" />}
                </FormField>
              </div>
            </div>
          </section>

          <section aria-labelledby={`${formId}-pricing`}>
            <h3 id={`${formId}-pricing`} className={styles.sectionTitle}>
              Pricing, tax &amp; inventory
            </h3>
            <div className="row g-3">
              <div className="col-12 col-sm-4">
                <FormField label="MRP (₹)" required error={errors.mrp?.message}>
                  {(field) => <Input {...field} {...register('mrp')} inputMode="decimal" autoComplete="off" />}
                </FormField>
              </div>
              <div className="col-12 col-sm-4">
                <FormField label="Selling price (₹)" required error={errors.sellingPrice?.message}>
                  {(field) => <Input {...field} {...register('sellingPrice')} inputMode="decimal" autoComplete="off" />}
                </FormField>
              </div>
              <div className="col-12 col-sm-4">
                {selectField('gstPercent', 'GST %', toOptions(options?.gstRates ?? [], (rate) => `${rate}%`))}
              </div>
              <div className="col-12 col-sm-4">
                <FormField
                  label="Stock units"
                  required
                  error={errors.stock?.message}
                  hint={isEditing ? `Low-stock alert at ${pluralize(product.lowStockThreshold, 'unit')}.` : undefined}
                >
                  {(field) => <Input {...field} {...register('stock')} inputMode="numeric" autoComplete="off" />}
                </FormField>
              </div>
              <div className="col-12 col-sm-4">
                <FormField label="PV" required error={errors.pv?.message}>
                  {(field) => <Input {...field} {...register('pv')} inputMode="numeric" autoComplete="off" />}
                </FormField>
              </div>
              <div className="col-12 col-sm-4">{selectField('unit', 'Unit', toOptions(unitValues), { isSearchable: true })}</div>
              <div className="col-12">
                <FormField label="Description" error={errors.description?.message}>
                  {({ invalid, ...field }) => (
                    <textarea {...field} {...register('description')} rows={2} className={styles.textarea} data-invalid={invalid || undefined} />
                  )}
                </FormField>
              </div>
            </div>
            <p className={styles.note}>
              Prices include GST. The discount is calculated automatically when you save
              {isEditing && product.discountPercent > 0 ? ` (currently ${formatPercent(product.discountPercent)}).` : '.'}
            </p>
          </section>
        </div>
      </form>
    </Modal>
  )
}
