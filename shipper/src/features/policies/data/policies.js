// ASSUMPTION — confirm with the business: placeholder policy text.
// The wording below is plausible filler so the screens can be reviewed. Legal copy for shipping, returns and
// refunds, privacy and terms must be written or approved by the business (and, for privacy and terms, by counsel)
// before launch. Time windows mentioned here (for example "7 days") are placeholders, not agreed rules.
//
// The slugs match the footer links in app/config/storefront.js (POLICY_PAGES). Every body is
// { heading, paragraphs?: string[], points?: string[] } so the page only has to render a list of sections.
export const POLICIES = {
  shipping: {
    title: 'Shipping policy',
    summary: 'Where we deliver, how long it takes and what you can expect once your order is on its way.',
    sections: [
      {
        heading: 'Where we deliver',
        paragraphs: [
          'We ship across India through India Post Speed Post to every PIN code we serve. Enter your PIN code on a product page or at checkout to see whether we deliver to you and when to expect your order.',
        ],
      },
      {
        heading: 'Delivery times',
        paragraphs: [
          'Most orders are packed within one to two working days of payment. Once dispatched, delivery usually takes a few working days depending on where you live.',
          'The delivery date shown at checkout and on your order page is an estimate, not a guarantee. Remote areas, weather and public holidays can add time.',
        ],
      },
      {
        heading: 'Shipping charges',
        paragraphs: [
          'Shipping charges, and any free-shipping offer, are worked out when you check out. The amount shown in your cart and at checkout is the amount you pay; we never add shipping afterwards.',
        ],
      },
      {
        heading: 'Tracking your order',
        paragraphs: [
          'When your order is dispatched we give you an India Post consignment ID. Follow your parcel from My orders, or use Track shipment with your order number and mobile number.',
        ],
      },
      {
        heading: 'Delays and failed deliveries',
        points: [
          'If your parcel is later than the estimate, contact us and we will follow it up with the carrier.',
          'Please keep your address and mobile number up to date. A parcel that cannot be delivered is returned to us, and we will refund your order.',
        ],
      },
    ],
  },

  returns: {
    title: 'Returns & refunds',
    summary: 'What you can return, how to ask for a refund and how long it takes.',
    sections: [
      {
        heading: 'Return window',
        paragraphs: [
          'Tell us within 7 days of delivery if something arrives damaged, leaking, past its date or different from what you ordered, and we will make it right.',
        ],
      },
      {
        heading: 'What can be returned',
        points: [
          'Products that arrive damaged, defective or incorrect.',
          'Unopened items in their original packaging.',
          'For hygiene and food safety, opened personal care, cosmetics and grocery items can only be returned if they were damaged or incorrect when they arrived.',
        ],
      },
      {
        heading: 'How to start a return',
        paragraphs: [
          'Contact our support team with your order number and a clear photo of the item and its packaging. We will confirm the next step and, where needed, arrange a pickup.',
        ],
      },
      {
        heading: 'How refunds are paid',
        paragraphs: [
          'Approved refunds go back to your original payment method or to your Shipper wallet, depending on the order. Refunds to a bank account, card or UPI usually reach you within 5 to 7 working days of approval; wallet refunds are credited straight away.',
        ],
      },
      {
        heading: 'Cancelling an order',
        paragraphs: [
          'You can ask us to cancel an order until it has been packed. After it has been dispatched an order cannot be cancelled, but you can return it once it is delivered.',
        ],
      },
    ],
  },

  privacy: {
    title: 'Privacy policy',
    summary: 'What we collect, why we collect it and the choices you have.',
    sections: [
      {
        heading: 'What we collect',
        points: [
          'Account details: your name, mobile number and email address.',
          'Delivery details: the addresses you save and the delivery instructions you give.',
          'Order details: what you buy, when, and how you pay. Payments are processed by Razorpay; we do not store your card or UPI details.',
          'Basic usage data that helps us keep the site fast and secure.',
        ],
      },
      {
        heading: 'How we use it',
        paragraphs: [
          'We use your information to process and deliver your orders, send order and delivery updates, give you support, prevent fraud and improve the store. We only send marketing messages if you have agreed to them.',
        ],
      },
      {
        heading: 'Who we share it with',
        paragraphs: [
          'We share what is needed to fulfil your order with our delivery partner, India Post, and with our payment provider. We do not sell your personal information.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          'You can view and update your details, addresses and password from your account at any time. To ask for a copy of your data or to have your account deleted, contact our support team.',
        ],
      },
      {
        heading: 'Keeping your data safe',
        paragraphs: [
          'We protect your information with technical and organisational safeguards and keep it only for as long as we need it for your orders, accounting and legal obligations.',
        ],
      },
    ],
  },

  terms: {
    title: 'Terms of service',
    summary: 'The ground rules for using Shipper.com and placing orders.',
    sections: [
      {
        heading: 'Using Shipper.com',
        paragraphs: [
          'By browsing or ordering on Shipper.com you agree to these terms. Please use the store lawfully and only for your own purchases.',
        ],
      },
      {
        heading: 'Your account',
        paragraphs: [
          'You are responsible for keeping your password safe and for what happens under your account. Tell us straight away if you think someone else has used it.',
        ],
      },
      {
        heading: 'Orders and prices',
        paragraphs: [
          'Prices are shown in Indian rupees and include GST. An order is confirmed when payment succeeds. If a product is unavailable or a price was shown in error, we may cancel the order and refund you in full.',
        ],
      },
      {
        heading: 'Payments',
        paragraphs: [
          'Payments are handled securely by Razorpay. If a payment fails or is declined, your order is not confirmed and no amount is kept.',
        ],
      },
      {
        heading: 'Wallet and coupons',
        paragraphs: [
          'Your Shipper wallet balance can be used towards eligible orders as shown at checkout. It has no cash value, cannot be transferred and may not be combined with every offer. Coupons are subject to the conditions shown with them.',
        ],
      },
      {
        heading: 'Liability and changes',
        paragraphs: [
          'We take care to describe products accurately, but we are not liable for losses beyond the value of your order, except where the law says otherwise. We may update these terms from time to time; the version on this page is the one that applies.',
        ],
      },
    ],
  },
}

/** The policy for a URL slug, or null for an unknown one. */
export const getPolicy = (slug) => (Object.hasOwn(POLICIES, slug) ? POLICIES[slug] : null)
