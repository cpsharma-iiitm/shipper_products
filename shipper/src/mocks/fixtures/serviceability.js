// DEV FIXTURE: PIN codes the fake backend "delivers" to. Anything else is not serviceable.
// ASSUMPTION — confirm with backend team: serviceability, ETA ranges and the shipping method come from the backend.
export const SERVICEABLE_PINS = {
  226010: { city: 'Lucknow', state: 'Uttar Pradesh', etaMinDays: 3, etaMaxDays: 5 },
  226001: { city: 'Lucknow', state: 'Uttar Pradesh', etaMinDays: 3, etaMaxDays: 5 },
  110001: { city: 'New Delhi', state: 'Delhi', etaMinDays: 2, etaMaxDays: 4 },
  400001: { city: 'Mumbai', state: 'Maharashtra', etaMinDays: 3, etaMaxDays: 5 },
  560001: { city: 'Bengaluru', state: 'Karnataka', etaMinDays: 3, etaMaxDays: 6 },
  600001: { city: 'Chennai', state: 'Tamil Nadu', etaMinDays: 4, etaMaxDays: 6 },
  700001: { city: 'Kolkata', state: 'West Bengal', etaMinDays: 4, etaMaxDays: 6 },
  302001: { city: 'Jaipur', state: 'Rajasthan', etaMinDays: 3, etaMaxDays: 5 },
  682001: { city: 'Kochi', state: 'Kerala', etaMinDays: 4, etaMaxDays: 7 },
}

export const SHIPPING_METHOD = 'Standard · India Post'
