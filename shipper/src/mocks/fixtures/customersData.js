// DEV FIXTURES — customers, saved addresses and wallet history (pure data).
// ASSUMPTION — confirm with backend team: every field name and the customer-code format (CUS00128).

// [code, name, city, state, pin, mobile, ordersCount, totalSpend, walletBalance, joined]
// ordersCount / totalSpend / walletBalance are backend aggregates (static here); the three named in the
// Reports screen (Aditi, Rohit, Meera) use the design's figures.
const ROWS = [
  ['CUS00101', 'Rohit Verma', 'Jaipur', 'Rajasthan', '302001', '9812300101', 8, 7280, 120, '2026-02-11'],
  ['CUS00102', 'Meera Nair', 'Kochi', 'Kerala', '682001', '9812300102', 15, 12480, 480, '2026-01-20'],
  ['CUS00103', 'Neha Singh', 'Lucknow', 'Uttar Pradesh', '226001', '9812300103', 6, 4210, 60, '2026-03-04'],
  ['CUS00104', 'Arjun Patel', 'Mumbai', 'Maharashtra', '400001', '9812300104', 9, 8120, 0, '2026-02-02'],
  ['CUS00105', 'Kavya Shah', 'Bengaluru', 'Karnataka', '560001', '9812300105', 5, 3640, 40, '2026-04-18'],
  ['CUS00106', 'Vikram Rao', 'Chennai', 'Tamil Nadu', '600001', '9812300106', 4, 2980, 0, '2026-05-09'],
  ['CUS00107', 'Karan Malhotra', 'Jaipur', 'Rajasthan', '302001', '9812300107', 7, 9640, 0, '2026-03-22'],
  ['CUS00108', 'Nisha Kapoor', 'New Delhi', 'Delhi', '110001', '9812300108', 11, 9210, 200, '2026-01-14'],
  ['CUS00109', 'Rajesh Gupta', 'New Delhi', 'Delhi', '110001', '9812300109', 3, 1860, 0, '2026-06-02'],
  ['CUS00110', 'Sonal Mehta', 'Mumbai', 'Maharashtra', '400001', '9812300110', 6, 5120, 90, '2026-04-01'],
  ['CUS00111', 'Deepak Saini', 'Jaipur', 'Rajasthan', '302001', '9812300111', 2, 1180, 0, '2026-07-12'],
  ['CUS00112', 'Priya Iyer', 'Chennai', 'Tamil Nadu', '600001', '9812300112', 10, 8760, 150, '2026-02-27'],
  ['CUS00113', 'Ankit Jain', 'Bengaluru', 'Karnataka', '560001', '9812300113', 5, 3980, 0, '2026-05-30'],
  ['CUS00114', 'Pooja Reddy', 'Bengaluru', 'Karnataka', '560001', '9812300114', 8, 6740, 80, '2026-03-15'],
  ['CUS00115', 'Riya Das', 'Kolkata', 'West Bengal', '700001', '9812300115', 4, 2760, 0, '2026-06-21'],
  ['CUS00116', 'Sanya Gupta', 'Lucknow', 'Uttar Pradesh', '226010', '9812300116', 6, 4480, 30, '2026-04-09'],
  ['CUS00117', 'Manish Tiwari', 'Lucknow', 'Uttar Pradesh', '226001', '9812300117', 3, 2040, 0, '2026-08-03'],
  ['CUS00118', 'Sunita Devi', 'Lucknow', 'Uttar Pradesh', '226010', '9812300118', 12, 10320, 310, '2026-01-08'],
  ['CUS00119', 'Farhan Ali', 'New Delhi', 'Delhi', '110001', '9812300119', 2, 1420, 0, '2026-08-19'],
  ['CUS00120', 'Ishita Banerjee', 'Kolkata', 'West Bengal', '700001', '9812300120', 7, 5690, 70, '2026-03-28'],
  ['CUS00121', 'Harsh Vardhan', 'Jaipur', 'Rajasthan', '302001', '9812300121', 5, 3320, 0, '2026-05-14'],
  ['CUS00122', 'Lakshmi Menon', 'Kochi', 'Kerala', '682001', '9812300122', 9, 7480, 120, '2026-02-16'],
  ['CUS00123', 'Gurpreet Kaur', 'New Delhi', 'Delhi', '110001', '9812300123', 4, 2860, 0, '2026-06-30'],
  ['CUS00124', 'Tanvi Desai', 'Mumbai', 'Maharashtra', '400001', '9812300124', 6, 4930, 50, '2026-04-25'],
  ['CUS00125', 'Suresh Pillai', 'Kochi', 'Kerala', '682001', '9812300125', 3, 2210, 0, '2026-07-07'],
  ['CUS00126', 'Anjali Mishra', 'Lucknow', 'Uttar Pradesh', '226010', '9812300126', 8, 6120, 100, '2026-03-02'],
  ['CUS00127', 'Varun Kapoor', 'New Delhi', 'Delhi', '110001', '9812300127', 5, 4040, 0, '2026-05-21'],
  ['CUS00129', 'Divya Nambiar', 'Kochi', 'Kerala', '682001', '9812300129', 7, 5560, 90, '2026-03-11'],
  ['CUS00130', 'Rahul Dubey', 'Lucknow', 'Uttar Pradesh', '226001', '9812300130', 2, 1360, 0, '2026-08-27'],
  ['CUS00132', 'Shreya Ghosh', 'Kolkata', 'West Bengal', '700001', '9812300132', 6, 4710, 40, '2026-04-14'],
  ['CUS00133', 'Imran Qureshi', 'Bengaluru', 'Karnataka', '560001', '9812300133', 3, 2490, 0, '2026-07-19'],
  ['CUS00134', 'Pallavi Joshi', 'Jaipur', 'Rajasthan', '302001', '9812300134', 5, 3870, 60, '2026-05-05'],
  ['CUS00135', 'Naveen Reddy', 'Chennai', 'Tamil Nadu', '600001', '9812300135', 4, 3140, 0, '2026-06-12'],
  ['CUS00136', 'Komal Chauhan', 'Mumbai', 'Maharashtra', '400001', '9812300136', 8, 6980, 110, '2026-02-23'],
  ['CUS00137', 'Siddharth Rao', 'Bengaluru', 'Karnataka', '560001', '9812300137', 2, 1520, 0, '2026-09-01'],
  ['CUS00138', 'Bhavna Patel', 'Mumbai', 'Maharashtra', '400001', '9812300138', 6, 5240, 70, '2026-04-30'],
  ['CUS00139', 'Mohit Agarwal', 'New Delhi', 'Delhi', '110001', '9812300139', 4, 3380, 0, '2026-06-08'],
  ['CUS00140', 'Swati Kulkarni', 'Mumbai', 'Maharashtra', '400001', '9812300140', 3, 2270, 0, '2026-08-11'],
]

const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, '')

// Aditi Sharma is the demo storefront account (mobile 9876543210, see fixtures/users.js).
// ASSUMPTION: the design shows a second "Aditi Sharma" (order SH10488 in Store Operation) next to her own
// orders; it is modelled as a different customer with the same name (a common Indian name).
const ADITI = ['CUS00128', 'Aditi Sharma', 'Lucknow', 'Uttar Pradesh', '226010', '9876543210', 12, 9640, 250, '2026-08-02']
const ADITI_TWO = ['CUS00131', 'Aditi Sharma', 'Lucknow', 'Uttar Pradesh', '226010', '9810099921', 2, 1260, 0, '2026-09-26']

function toCustomer([code, name, city, state, pin, mobile, ordersCount, totalSpend, walletBalance, joinedOn], id, email) {
  return {
    id,
    code,
    name,
    email,
    mobile,
    city,
    state,
    pin,
    ordersCount,
    totalSpend,
    walletBalance,
    status: 'active',
    joinedAt: `${joinedOn}T10:00:00+05:30`,
  }
}

export function buildCustomers() {
  const customers = [
    toCustomer(ADITI, 'cus_aditi', 'aditi.sharma@gmail.com'),
    toCustomer(ADITI_TWO, 'cus_aditi_2', 'aditi.s.lucknow@gmail.com'),
    ...ROWS.map((row) => toCustomer(row, `cus_${slug(row[1])}`, `${row[1].toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`)),
  ]
  return customers.sort((a, b) => a.code.localeCompare(b.code))
}

// Saved addresses (storefront profile, checkout and admin purchase). Aditi's two come from the design.
export function buildAddresses(customers) {
  const byCustomer = {}
  customers.forEach((customer) => {
    if (customer.id === 'cus_aditi') {
      byCustomer[customer.id] = [
        {
          id: 'addr_aditi_home',
          label: 'Home',
          name: 'Aditi Sharma',
          mobile: '9876543210',
          line1: '24, Gomti Greens',
          line2: 'Vibhuti Khand, Gomti Nagar',
          landmark: 'Near Janeshwar Mishra Park',
          city: 'Lucknow',
          state: 'Uttar Pradesh',
          pin: '226010',
          isDefault: true,
          verified: true,
        },
        {
          id: 'addr_aditi_office',
          label: 'Office',
          name: 'Aditi Sharma',
          mobile: '9876543210',
          line1: 'B-12, Cyber Heights',
          line2: 'Vibhuti Khand',
          landmark: '',
          city: 'Lucknow',
          state: 'Uttar Pradesh',
          pin: '226010',
          isDefault: false,
          verified: true,
        },
      ]
      return
    }
    byCustomer[customer.id] = [
      {
        id: `addr_${customer.id}_home`,
        label: 'Home',
        name: customer.name,
        mobile: customer.mobile,
        line1: `${12 + (customer.code.slice(-2) % 40)}, Green Park Residency`,
        line2: 'Main Road, Sector 4',
        landmark: '',
        city: customer.city,
        state: customer.state,
        pin: customer.pin,
        isDefault: true,
        verified: true,
      },
    ]
  })
  return byCustomer
}

// Wallet ledger. Aditi's balance walks 0 → 200 → 250 → 350 (1 Oct opening) → 250 (after SH10482).
export const WALLET_TRANSACTIONS = [
  { id: 'wtx_1', customerId: 'cus_aditi', type: 'credit', amount: 200, reason: 'Welcome bonus', reference: null, at: '2026-08-02T10:05:00+05:30' },
  { id: 'wtx_2', customerId: 'cus_aditi', type: 'credit', amount: 50, reason: 'Cashback on order SH09871', reference: 'SH09871', at: '2026-08-28T18:20:00+05:30' },
  { id: 'wtx_3', customerId: 'cus_aditi', type: 'credit', amount: 100, reason: 'Refund · order SH10074', reference: 'SH10074', at: '2026-09-18T12:30:00+05:30' },
  { id: 'wtx_4', customerId: 'cus_aditi', type: 'debit', amount: 100, reason: 'Used on order SH10482', reference: 'SH10482', at: '2026-10-24T10:42:00+05:30' },
]
