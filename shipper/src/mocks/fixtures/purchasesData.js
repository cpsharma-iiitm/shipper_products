// DEV FIXTURES — admin purchases (pure data, no imports).
//
// A "purchase" is an assisted purchase an admin creates for a customer (design p-14): the customer,
// a delivery address, line items, GST-inclusive totals and a payment request. The handler turns each
// seed row into a full record by pricing the lines with the fake backend's quote rules, so totals
// are never typed in by hand. Every shape is an ASSUMPTION — confirm with backend team.

export const PAYMENT_METHODS = [
  { value: 'razorpay_upi', label: 'Razorpay · UPI', collectLabel: 'Collect via UPI' },
  { value: 'razorpay_card', label: 'Razorpay · Card', collectLabel: 'Collect via card' },
  { value: 'razorpay_netbanking', label: 'Razorpay · Netbanking', collectLabel: 'Collect via netbanking' },
]

export const PURCHASE_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'payment_pending', label: 'Payment pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
]

// [purchaseNumber, customerCode, createdAt (IST), createdBy, status, paymentMethod, [[productCode, quantity]], useWallet]
export const PURCHASE_SEEDS = [
  ['PUR-1028-01', 'CUS00101', '2026-10-28T09:05:00+05:30', 'Pawan Yadav', 'paid', 'razorpay_upi', [['GR005', 4], ['SH002', 1]], false],
  ['PUR-1028-02', 'CUS00102', '2026-10-28T09:20:00+05:30', 'Pawan Yadav', 'payment_pending', 'razorpay_upi', [['HL001', 2], ['PC006', 1]], false],
  ['PUR-1028-03', 'CUS00103', '2026-10-28T09:48:00+05:30', 'Ritu Saxena', 'draft', 'razorpay_upi', [['SH002', 1], ['PC003', 1]], false],
  ['PUR-1028-04', 'CUS00104', '2026-10-28T10:02:00+05:30', 'Pawan Yadav', 'paid', 'razorpay_card', [['HL001', 1], ['SH002', 1], ['GR005', 3]], false],
  ['PUR-1028-05', 'CUS00118', '2026-10-28T10:15:00+05:30', 'Ritu Saxena', 'paid', 'razorpay_upi', [['PC003', 2], ['CO004', 1]], true],
  ['PUR-1028-06', 'CUS00105', '2026-10-28T10:33:00+05:30', 'Pawan Yadav', 'payment_pending', 'razorpay_netbanking', [['GR005', 2], ['HL007', 1]], false],
  ['PUR-1028-07', 'CUS00126', '2026-10-28T10:50:00+05:30', 'Ritu Saxena', 'draft', 'razorpay_upi', [['CO004', 2]], false],
  ['PUR-1028-08', 'CUS00112', '2026-10-28T11:10:00+05:30', 'Pawan Yadav', 'cancelled', 'razorpay_upi', [['SH002', 2]], false],
  ['PUR-1027-01', 'CUS00107', '2026-10-27T16:40:00+05:30', 'Pawan Yadav', 'paid', 'razorpay_card', [['HL001', 3], ['PC003', 2], ['GR005', 1]], false],
  ['PUR-1027-02', 'CUS00108', '2026-10-27T14:15:00+05:30', 'Ritu Saxena', 'paid', 'razorpay_upi', [['CO004', 1], ['SH002', 2]], true],
  ['PUR-1027-03', 'CUS00110', '2026-10-27T11:30:00+05:30', 'Pawan Yadav', 'payment_pending', 'razorpay_upi', [['HL008', 2], ['HL001', 1]], false],
  ['PUR-1026-01', 'CUS00102', '2026-10-26T15:05:00+05:30', 'Pawan Yadav', 'paid', 'razorpay_netbanking', [['PC006', 2], ['PC003', 1]], false],
  ['PUR-1026-02', 'CUS00106', '2026-10-26T12:20:00+05:30', 'Ritu Saxena', 'cancelled', 'razorpay_upi', [['GR005', 1]], false],
  ['PUR-1025-01', 'CUS00101', '2026-10-25T10:10:00+05:30', 'Pawan Yadav', 'paid', 'razorpay_upi', [['HL001', 2], ['SH002', 3]], false],
]
