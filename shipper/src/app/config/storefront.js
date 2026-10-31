// Marketing and contact copy shown across the storefront.
// ASSUMPTION — confirm with business/backend team: the free-shipping threshold, support contact and
// payment-method names below are content, not rules. Shipping fees and thresholds are enforced by
// the backend; the cart and checkout always display the backend quote.
export const STOREFRONT = {
  announcement: {
    lead: "Good things, delivered.",
    detail: "Free shipping on orders ₹999+",
  },
  supportEmail: "care@shipper.com",
  supportPhone: "1800 123 7447",
  tagline:
    "Thoughtful essentials for everyday India. Quality you can trust, value you can feel.",
  paymentMethods: ["UPI", "VISA", "Mastercard", "Razorpay"],
};
export const POLICY_PAGES = [
  { slug: "shipping", label: "Shipping policy" },
  { slug: "returns", label: "Returns & refunds" },
  { slug: "privacy", label: "Privacy policy" },
  { slug: "terms", label: "Terms of service" },
];
