// Display helpers for the address shape the backend returns (ASSUMPTION — confirm with backend team):
// { label?, name?, mobile?, line1, line2?, landmark?, city, state, pin }

/** "24, Gomti Greens, Vibhuti Khand, Gomti Nagar, Lucknow, Uttar Pradesh – 226010" */
export function formatAddress(address, { includeLandmark = false } = {}) {
  if (!address) return ''
  const street = [address.line1, address.line2, includeLandmark ? address.landmark : null].filter(Boolean).join(', ')
  const region = [address.city, address.state].filter(Boolean).join(', ')
  const regionWithPin = address.pin ? `${region} – ${address.pin}` : region
  return [street, regionWithPin].filter(Boolean).join(', ')
}

/** "+91 98765 43210" from a 10-digit mobile number; anything else is returned unchanged. */
export function formatMobile(mobile) {
  const digits = String(mobile ?? '').replace(/\D/g, '')
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits
  return local.length === 10 ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : String(mobile ?? '')
}
