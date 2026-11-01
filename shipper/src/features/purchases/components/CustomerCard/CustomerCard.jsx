import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Input from '@/components/atoms/Input'
import FormField from '@/components/molecules/FormField'
import { useCustomerLookup } from '@/features/purchases/hooks/usePurchases'
import styles from './CustomerCard.module.scss'

const labelOf = (customer) => `${customer.code} · ${customer.name}`
const groupMobile = (mobile) => (mobile?.length === 10 ? `${mobile.slice(0, 5)} ${mobile.slice(5)}` : (mobile ?? ''))

/**
 * Finds the customer by code, name, mobile or email. One match is selected straight away; several
 * are listed to pick from (two customers can share a name). The form keeps the chosen customer.
 */
export default function CustomerCard() {
  const { control, setValue, formState } = useFormContext()
  const customer = useWatch({ control, name: 'customer' })
  const lookup = useCustomerLookup()
  const [text, setText] = useState(customer ? labelOf(customer) : '')
  const [matches, setMatches] = useState([])
  const [notFound, setNotFound] = useState(null)

  const choose = (selected) => {
    const address = selected.addresses.find((entry) => entry.isDefault) ?? selected.addresses[0]
    setValue('customer', selected, { shouldValidate: true })
    setValue('addressId', address?.id ?? '', { shouldValidate: true })
    setValue('useWallet', selected.walletBalance > 0)
    setText(labelOf(selected))
    setMatches([])
    setNotFound(null)
  }

  const find = () => {
    const query = text.trim()
    if (query.length < 2) {
      setNotFound('Enter at least 2 characters of the customer code, name or mobile number.')
      return
    }
    lookup.mutate(query, {
      onSuccess: (items) => {
        setMatches(items.length > 1 ? items : [])
        setNotFound(items.length === 0 ? `No customer found for “${query}”.` : null)
        if (items.length === 1) choose(items[0])
      },
      onError: () => setNotFound('The customer search failed. Please try again.'),
    })
  }

  const handleChange = (event) => {
    setText(event.target.value)
    setNotFound(null)
    if (customer) {
      setValue('customer', null)
      setValue('addressId', '')
    }
  }

  const error = notFound ?? formState.errors.customer?.message

  return (
    <Card title="Customer details" radius="md" padding="sm">
      <div className={styles.lookup}>
        <FormField label="Customer lookup / code" error={error} className={styles.lookupField}>
          {(field) => (
            <Input
              {...field}
              value={text}
              onChange={handleChange}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  find()
                }
              }}
              placeholder="Customer code, name or mobile"
              autoComplete="off"
            />
          )}
        </FormField>
        <Button variant="secondary" size="sm" className={styles.find} loading={lookup.isPending} onClick={find}>
          Find
        </Button>
      </div>

      {matches.length > 0 && (
        <ul className={styles.matches} aria-label="Matching customers">
          {matches.map((match) => (
            <li key={match.code}>
              <button type="button" className={styles.match} onClick={() => choose(match)}>
                <strong>{labelOf(match)}</strong>
                <span>
                  {groupMobile(match.mobile)} · {match.addresses[0]?.city ?? 'No saved address'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="row gx-3 gy-0">
        <div className="col-12 col-md-5">
          <FormField label="Mobile">{(field) => <Input {...field} readOnly value={groupMobile(customer?.mobile)} />}</FormField>
        </div>
        <div className="col-12 col-md-7">
          <FormField label="Email">{(field) => <Input {...field} readOnly value={customer?.email ?? ''} />}</FormField>
        </div>
      </div>
    </Card>
  )
}
