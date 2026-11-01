// The checkout artboards word several headings differently on desktop and on mobile, so each variant
// keeps its own copy. `wide` is the two-column desktop layout, `compact` the single-column one below it.
export const WIDE_CHECKOUT_QUERY = '(min-width: 1024px)'

export const CHECKOUT_COPY = {
  wide: {
    steps: ['Cart', 'Delivery & payment', 'Confirmation'],
    contactTitle: '1. Contact details',
    emailLabel: 'Email for order updates',
    addressTitle: '2. Delivery address',
    alternateMobileLabel: 'Alternate mobile number (optional)',
    shippingTitle: '3. Shipping',
    walletPaymentTitle: '4. Wallet & payment',
    paymentHeading: 'Choose a payment method · Powered by Razorpay',
  },
  compact: {
    steps: ['Cart', 'Delivery & payment', 'Done'],
    contactTitle: 'Contact details',
    emailLabel: 'Email',
    addressTitle: 'Delivery address',
    alternateMobileLabel: 'Alternate mobile (optional)',
    shippingTitle: 'Shipping method',
    walletTitle: 'Wallet rewards',
    paymentTitle: 'Pay securely with Razorpay',
  },
}

export const ALTERNATE_MOBILE_COMPACT_ERROR = 'Use 10 digits, or leave this field blank.'
