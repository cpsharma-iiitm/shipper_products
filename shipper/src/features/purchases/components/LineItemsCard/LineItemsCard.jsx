import { useState } from 'react'
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Icon from '@/components/atoms/Icon'
import IconButton from '@/components/atoms/IconButton'
import Input from '@/components/atoms/Input'
import EmptyState from '@/components/molecules/EmptyState'
import FormField from '@/components/molecules/FormField'
import QuantityStepper from '@/components/molecules/QuantityStepper'
import SelectField from '@/components/molecules/SelectField'
import DataTable from '@/components/organisms/DataTable'
import { useSellableProducts } from '@/features/purchases/hooks/usePurchases'
import { formatINR, formatNumber, formatPercent, pluralize } from '@/lib/format'
import styles from './LineItemsCard.module.scss'

/**
 * Product picker, editable line items and the payment method. Prices, PV, GST and availability for
 * each line come from the backend quote; the screen only shows them. Until the quote arrives a new
 * line shows placeholders.
 */
export default function LineItemsCard({ quote, paymentMethods, reference }) {
  const { control, formState } = useFormContext()
  const { fields, append, update, remove } = useFieldArray({ control, name: 'lines' })
  const lines = useWatch({ control, name: 'lines' })
  const { data: products = [], isPending: productsPending } = useSellableProducts()
  const [pendingCode, setPendingCode] = useState(null)

  const quoted = Object.fromEntries((quote?.lines ?? []).map((line) => [line.productCode, line]))
  const options = products.map((product) => ({ value: product.code, label: `${product.code} · ${product.name} (${product.unit})` }))
  const rows = fields.map((field, index) => ({ ...field, index, quantity: lines?.[index]?.quantity ?? field.quantity }))
  const lineError = formState.errors.lines?.message ?? formState.errors.lines?.root?.message

  const addItem = () => {
    const product = products.find((entry) => entry.code === pendingCode)
    if (!product) return
    const index = fields.findIndex((field) => field.productCode === product.code)
    if (index >= 0) {
      const current = lines[index].quantity
      update(index, { productCode: product.code, name: product.name, quantity: Math.min(current + 1, product.stock) })
    } else {
      append({ productCode: product.code, name: product.name, quantity: 1 })
    }
    setPendingCode(null)
  }

  const units = rows.reduce((total, row) => total + row.quantity, 0)
  const columns = [
    {
      key: 'product',
      header: 'Code / product',
      cell: (row) => (
        <>
          {row.productCode} · {row.name}
          {quoted[row.productCode] && !quoted[row.productCode].available && (
            <span className={styles.shortage}>Only {formatNumber(quoted[row.productCode].availableStock)} in stock</span>
          )}
        </>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty',
      cell: (row) => (
        <QuantityStepper
          size="sm"
          label={`Quantity of ${row.name}`}
          value={row.quantity}
          max={quoted[row.productCode]?.maxQuantity}
          onChange={(quantity) => update(row.index, { productCode: row.productCode, name: row.name, quantity })}
        />
      ),
    },
    { key: 'pv', header: 'PV', cell: (row) => (quoted[row.productCode] ? formatNumber(quoted[row.productCode].linePv) : '—') },
    { key: 'mrp', header: 'MRP', cell: (row) => (quoted[row.productCode] ? formatINR(quoted[row.productCode].mrp) : '—') },
    { key: 'unitPrice', header: 'Unit incl. tax', cell: (row) => (quoted[row.productCode] ? formatINR(quoted[row.productCode].unitPrice) : '—') },
    { key: 'gst', header: 'GST', cell: (row) => (quoted[row.productCode] ? formatPercent(quoted[row.productCode].gstPercent) : '—') },
    { key: 'amount', header: 'Amount', cell: (row) => (quoted[row.productCode] ? formatINR(quoted[row.productCode].lineTotal) : '—') },
  ]

  const availability = quote?.availability

  return (
    <Card title="Purchase line items" radius="md" padding="sm" className={styles.card}>
      <div className={styles.picker}>
        <FormField label="Product code / name" className={styles.pickerField}>
          {(field) => (
            <SelectField
              id={field.id}
              size="md"
              isSearchable
              isLoading={productsPending}
              options={options}
              value={pendingCode}
              onChange={setPendingCode}
              placeholder="Search HL001, shampoo…"
              noOptionsMessage={() => 'No matching product in stock'}
            />
          )}
        </FormField>
        <Button leftIcon="plus-lg" disabled={!pendingCode} onClick={addItem}>
          Add item
        </Button>
      </div>

      <DataTable
        className={styles.table}
        caption="Purchase line items"
        columns={columns}
        rows={rows}
        minWidth="640px"
        actionsHeader={<span className="visually-hidden">Remove</span>}
        rowActions={(row) => <IconButton icon="x-lg" size="sm" label={`Remove ${row.name}`} onClick={() => remove(row.index)} />}
        emptyState={<EmptyState compact icon="cart-plus" title="No items yet" description="Search for a product above and add it to this purchase." />}
      />
      {lineError && (
        <p role="alert" className={styles.error}>
          {lineError}
        </p>
      )}

      <div className={styles.totals}>
        <p>
          {quote
            ? `${pluralize(quote.summary.products, 'product')} · ${pluralize(quote.summary.units, 'unit')} · Total PV ${formatNumber(quote.summary.totalPv)}`
            : `${pluralize(rows.length, 'product')} · ${pluralize(units, 'unit')}`}
        </p>
        {quote && <p className={styles.items}>Items {formatINR(quote.summary.itemsTotal, { decimals: 2 })}</p>}
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <FormField label="Payment method" error={formState.errors.paymentMethod?.message}>
            {(field) => (
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <SelectField id={field.id} size="md" invalid={field.invalid} options={paymentMethods} value={value} onChange={onChange} />
                )}
              />
            )}
          </FormField>
        </div>
        <div className="col-12 col-md-6">
          <FormField label="Reference">{(field) => <Input {...field} size="md" readOnly value={reference ?? 'To be generated'} />}</FormField>
        </div>
      </div>

      <p className={availability && !availability.allAvailable ? styles.unavailable : styles.available} role="status">
        <Icon name={availability && !availability.allAvailable ? 'exclamation-circle' : 'check2'} />{' '}
        {availability && !availability.allAvailable ? availability.message : 'All quantities are available. Prices are GST-inclusive.'}
      </p>
    </Card>
  )
}
