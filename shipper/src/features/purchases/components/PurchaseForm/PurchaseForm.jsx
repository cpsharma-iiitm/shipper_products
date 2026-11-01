import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import { selectCurrentUser } from '@/app/store'
import CustomerCard from '@/features/purchases/components/CustomerCard'
import DeliveryAddressCard from '@/features/purchases/components/DeliveryAddressCard'
import LineItemsCard from '@/features/purchases/components/LineItemsCard'
import PurchaseSummaryCard from '@/features/purchases/components/PurchaseSummaryCard'
import { usePurchaseQuote, useSavePurchase } from '@/features/purchases/hooks/usePurchases'
import { purchaseSchema } from '@/features/purchases/schemas/purchaseSchema'
import styles from './PurchaseForm.module.scss'

function toDefaultValues(purchase, paymentMethods) {
  if (!purchase) return { customer: null, addressId: '', lines: [], useWallet: false, paymentMethod: paymentMethods[0]?.value ?? '' }
  return {
    customer: purchase.customer,
    addressId: purchase.address.id,
    lines: purchase.lines.map(({ productCode, name, quantity }) => ({ productCode, name, quantity })),
    useWallet: purchase.useWallet,
    paymentMethod: purchase.paymentMethod,
  }
}

/**
 * The create-purchase form: customer, delivery address, line items and the backend quote. A new quote
 * is requested whenever the customer, address, items or wallet choice changes. `purchase` is a saved
 * draft being continued. "Save draft" keeps it for later; "Create purchase" raises the payment request.
 */
export default function PurchaseForm({ draftNumber, paymentMethods, purchase = null }) {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const save = useSavePurchase()
  const methods = useForm({ resolver: zodResolver(purchaseSchema), defaultValues: toDefaultValues(purchase, paymentMethods) })
  const [customer, addressId, lines, useWallet, paymentMethod] = useWatch({
    control: methods.control,
    name: ['customer', 'addressId', 'lines', 'useWallet', 'paymentMethod'],
  })

  const request =
    customer && addressId
      ? { customerCode: customer.code, addressId, lines: lines.map(({ productCode, quantity }) => ({ productCode, quantity })), useWallet }
      : null
  const { data: quote, isError: quoteFailed, error: quoteError } = usePurchaseQuote(request)

  const pendingAction = save.isPending ? save.variables.action : null
  const collectLabel = paymentMethods.find((method) => method.value === paymentMethod)?.collectLabel ?? 'Collect payment'
  const canSubmit = Boolean(quote) && quote.delivery.serviceable && quote.availability.allAvailable && lines.length > 0

  const saveAs = (action) =>
    methods.handleSubmit((values) => {
      save.mutate(
        {
          action,
          purchaseNumber: draftNumber,
          customerCode: values.customer.code,
          addressId: values.addressId,
          lines: values.lines.map(({ productCode, quantity }) => ({ productCode, quantity })),
          useWallet: values.useWallet,
          paymentMethod: values.paymentMethod,
        },
        {
          onSuccess: (saved) => {
            toast.success(
              action === 'submit'
                ? `${saved.purchaseNumber} created. Payment request sent to ${saved.customer.name}.`
                : `${saved.purchaseNumber} saved as a draft.`,
            )
            navigate(paths.admin.purchases)
          },
        },
      )
    })

  const serverError = save.isError ? getErrorMessage(save.error) : quoteFailed ? getErrorMessage(quoteError) : null

  return (
    <FormProvider {...methods}>
      <form noValidate className={styles.form} onSubmit={(event) => event.preventDefault()}>
        <div className={styles.topRow}>
          <CustomerCard />
          <DeliveryAddressCard delivery={quote?.delivery} />
        </div>
        <div className={styles.bottomRow}>
          <LineItemsCard quote={quote} paymentMethods={paymentMethods} reference={purchase?.reference} />
          <PurchaseSummaryCard
            quote={quote}
            collectLabel={collectLabel}
            pendingAction={pendingAction}
            canSubmit={canSubmit}
            serverError={serverError}
            onSave={(action) => saveAs(action)()}
          />
        </div>
        <p className={styles.footnote}>
          Purchase will reserve stock and send the payment request to {customer?.name ?? 'the customer'}. Created by{' '}
          {purchase?.createdBy ?? user?.name}.
        </p>
      </form>
    </FormProvider>
  )
}
