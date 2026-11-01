import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '@/app/services'
import { paths } from '@/app/router/paths'
import { selectActiveCartItems, selectCurrentUser, selectDeliveryLocation } from '@/app/store'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Spinner from '@/components/atoms/Spinner'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { AddressDrawer, useAddresses } from '@/features/addresses'
import { OrderSummaryCard, couponSearch, useCartQuote, useCouponCode } from '@/features/cart'
import { lineHasStockProblem } from '@/features/cart/lib/lineStock'
import AddressSection from '@/features/checkout/components/AddressSection'
import CheckoutSteps from '@/features/checkout/components/CheckoutSteps'
import ContactSection from '@/features/checkout/components/ContactSection'
import OrderItemsCard from '@/features/checkout/components/OrderItemsCard'
import PayAction from '@/features/checkout/components/PayAction'
import PaymentSections from '@/features/checkout/components/PaymentSections'
import ShippingSection from '@/features/checkout/components/ShippingSection'
import TermsConsent from '@/features/checkout/components/TermsConsent'
import { useCheckoutPayment } from '@/features/checkout/hooks/useCheckoutPayment'
import { CHECKOUT_COPY, WIDE_CHECKOUT_QUERY } from '@/features/checkout/lib/checkoutCopy'
import { checkoutSchema } from '@/features/checkout/schemas/checkoutSchema'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { formatMobile } from '@/lib/address'
import { pluralize } from '@/lib/format'
import styles from './CheckoutFlow.module.scss'

const SECURE_NOTE = 'Secure payments by Razorpay. Prices include all applicable taxes.'

/**
 * Delivery and payment for the cart. The customer's choices (address, wallet, coupon, payment method) go to
 * the backend, which prices the order; every amount on screen is read from that quote.
 */
export default function CheckoutFlow() {
  const wide = useMediaQuery(WIDE_CHECKOUT_QUERY)
  const copy = CHECKOUT_COPY[wide ? 'wide' : 'compact']
  const user = useSelector(selectCurrentUser)
  const cartItems = useSelector(selectActiveCartItems)
  const deliveryLocation = useSelector(selectDeliveryLocation)
  const [couponCode] = useCouponCode()

  const addresses = useAddresses()
  const [chosenAddressId, setChosenAddressId] = useState(null)
  const [editedAddress, setEditedAddress] = useState(null)
  const addressDrawer = useDisclosure()
  const [useWallet, setUseWallet] = useState(true)
  const payment = useCheckoutPayment()

  const address = addresses.data?.find((entry) => entry.id === chosenAddressId) ?? addresses.data?.[0] ?? null
  // Without a saved address the quote still shows delivery for the PIN picked in the header.
  const quote = useCartQuote({
    couponCode,
    useWallet,
    addressId: address?.id,
    pin: address ? undefined : deliveryLocation?.pin,
    enabled: addresses.isSuccess,
  })

  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
    defaultValues: {
      name: user?.name ?? '',
      mobile: formatMobile(user?.mobile),
      email: user?.email ?? '',
      deliveryInstructions: '',
      alternateMobile: '',
      paymentMethod: 'upi',
      upiId: '',
      acceptTerms: false,
    },
  })

  const openAddressDrawer = (toEdit = null) => {
    setEditedAddress(toEdit)
    addressDrawer.open()
  }

  const submit = form.handleSubmit((values) => {
    payment.mutate({
      order: {
        items: cartItems.map(({ productCode, quantity }) => ({ productCode, quantity })),
        couponCode: quote.data.coupon?.valid ? couponCode : undefined,
        useWallet,
        addressId: address.id,
        contact: { name: values.name, mobile: values.mobile, email: values.email },
        alternateMobile: values.alternateMobile || undefined,
        deliveryInstructions: values.deliveryInstructions || undefined,
        expectedPayable: quote.data.summary.payable,
      },
      payment: {
        method: values.paymentMethod,
        upiId: values.upiId,
        prefill: { name: values.name, email: values.email, contact: values.mobile },
      },
    })
  })

  if (payment.isSuccess) {
    return (
      <div className={styles.status} role="status">
        <Spinner decorative />
        Payment received. Taking you to your order…
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.screen}>
        <EmptyState
          icon="bag"
          title="Your cart is empty"
          description="Add something to your cart before checking out."
          action={
            <Button as={Link} to={paths.shop}>
              Start shopping
            </Button>
          }
        />
      </div>
    )
  }

  const quantityOf = new Map(cartItems.map((item) => [item.productCode, item.quantity]))
  const lines = (quote.data?.lines ?? []).map((line) => ({ ...line, quantity: quantityOf.get(line.productCode) ?? line.quantity }))
  const stockProblem = lines.some((line) => lineHasStockProblem(line, line.quantity))
  const unserviceable = quote.data?.delivery.serviceable === false

  let blocker = null
  if (addresses.isSuccess && !address) blocker = 'Choose a delivery address to continue.'
  else if (unserviceable) blocker = 'We can’t deliver to this address yet. Choose another address.'
  else if (stockProblem) blocker = 'Some items are unavailable in the quantity you chose. Update your cart to continue.'
  const notReady = !quote.data || quote.isFetching || payment.isPending

  const cartSearch = couponSearch(couponCode)
  const payAction = (
    <PayAction
      payable={quote.data?.summary.payable}
      loading={payment.isPending}
      disabled={notReady}
      blocker={blocker}
      error={payment.error}
    />
  )

  let summary = null
  if (quote.data && wide) {
    summary = (
      <>
        <OrderSummaryCard quote={quote.data} busy={quote.isFetching}>
          <div className={styles.cta}>{payAction}</div>
          <p className={styles.note}>{SECURE_NOTE}</p>
        </OrderSummaryCard>
        <OrderItemsCard lines={lines} cartSearch={cartSearch} />
        <Badge tone="success" className={styles.secure}>
          100% secure checkout
        </Badge>
      </>
    )
  } else if (quote.data) {
    summary = (
      <>
        <OrderSummaryCard quote={quote.data} busy={quote.isFetching} title={`Your order · ${pluralize(quote.data.summary.units, 'unit')}`} showLines compact />
        <TermsConsent compact />
        {payAction}
        <p className={styles.footnote}>Encrypted payments. Quality essentials. Peace of mind.</p>
      </>
    )
  }

  return (
    <FormProvider {...form}>
      <form className={styles.screen} onSubmit={submit} noValidate aria-busy={payment.isPending || undefined}>
        {wide ? (
          <CheckoutSteps steps={copy.steps} currentIndex={1} />
        ) : (
          <Button as={Link} to={{ pathname: paths.cart, search: cartSearch }} variant="link" leftIcon="arrow-left" className={styles.back}>
            Back to cart
          </Button>
        )}
        <header className={styles.header}>
          <h1 className={styles.title}>Make it yours.</h1>
          {wide && <p className={styles.subtitle}>A secure checkout. A little everyday goodness on its way.</p>}
        </header>
        {!wide && <CheckoutSteps steps={copy.steps} currentIndex={1} />}

        <div className={styles.layout}>
          <div className={styles.main}>
            <ContactSection compact={!wide} />
            <AddressSection
              compact={!wide}
              addresses={addresses}
              selectedId={address?.id}
              onSelect={setChosenAddressId}
              onAdd={() => openAddressDrawer()}
              onEdit={openAddressDrawer}
            />
            <ShippingSection delivery={quote.data?.delivery} compact={!wide} />
            <PaymentSections
              compact={!wide}
              wallet={quote.data?.wallet}
              useWallet={useWallet}
              onWalletChange={setUseWallet}
              payable={quote.data?.summary.payable}
            />
            {!wide && summary}
          </div>
          {wide && <aside className={styles.aside}>{summary}</aside>}
        </div>

        {quote.isError && !quote.data && (
          <ErrorState title="We couldn’t price your order" message={getErrorMessage(quote.error)} onRetry={quote.refetch} compact />
        )}
      </form>

      <AddressDrawer
        open={addressDrawer.isOpen}
        onClose={addressDrawer.close}
        address={editedAddress}
        defaults={{ name: user?.name, mobile: user?.mobile }}
        onSaved={(saved) => setChosenAddressId(saved.id)}
      />
    </FormProvider>
  )
}
