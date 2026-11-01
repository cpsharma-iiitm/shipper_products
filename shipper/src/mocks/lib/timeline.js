// DEV FIXTURES — the customer-facing tracking timeline the fake backend derives from an order's
// timestamps. The frontend only renders what it is given.
// ASSUMPTION — confirm with backend team: step names, notes and the `state` values.
//
//   [{ key, title, at: ISO | null, note, state: 'done' | 'current' | 'upcoming' }]
const shortDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' })
const minusHours = (iso, hours) => new Date(new Date(iso).getTime() - hours * 3_600_000).toISOString()

export function buildCustomerTimeline(order) {
  const { timestamps: t, shipment, status } = order
  const afterDispatch = ['in_transit', 'out_for_delivery', 'delivered', 'returned'].includes(status)
  const reachedOutForDelivery = ['out_for_delivery', 'delivered', 'returned'].includes(status)
  const expected = shipment?.expectedDelivery ? `Expected ${shortDate(shipment.expectedDelivery)}` : 'Expected soon'

  if (status === 'cancelled') {
    return [
      { key: 'confirmed', title: 'Order confirmed', at: t.confirmedAt, note: 'Payment received', state: 'done' },
      { key: 'cancelled', title: 'Cancelled', at: t.cancelledAt ?? null, note: 'Refund issued to the original payment method', state: 'current' },
    ]
  }

  const steps = [
    { key: 'confirmed', title: 'Order confirmed', at: t.confirmedAt, note: order.paymentStatus === 'paid' ? 'Payment received' : 'Awaiting payment' },
    { key: 'packed', title: 'Packed', at: t.packedAt ?? null, note: t.packedAt ? 'Lucknow warehouse' : 'We’ll pack it with care' },
    { key: 'dispatched', title: 'Dispatched', at: t.dispatchedAt ?? null, note: t.dispatchedAt ? 'India Post pickup' : 'Handed to India Post next' },
    {
      key: 'in_transit',
      title: 'In Transit',
      at: afterDispatch ? (t.inTransitAt ?? null) : null,
      note: afterDispatch ? (shipment?.lastUpdate?.note ?? 'On the way') : 'On the way to your city',
    },
    {
      key: 'out_for_delivery',
      title: 'Out for delivery',
      at: reachedOutForDelivery ? (t.outForDeliveryAt ?? (t.deliveredAt ? minusHours(t.deliveredAt, 5) : null)) : null,
      note: reachedOutForDelivery ? 'With the delivery agent' : expected,
    },
    {
      key: 'delivered',
      title: 'Delivered',
      at: t.deliveredAt ?? null,
      note: t.deliveredAt ? `Delivered to ${order.address.city}` : 'We’ll update you when it arrives',
    },
  ]
  if (status === 'returned') {
    steps.push({ key: 'returned', title: 'Returned', at: t.returnedAt ?? null, note: order.refund ? `Refund of ₹${order.refund.amount} to your ${order.refund.to}` : 'Return received', state: 'current' })
  }

  const lastDone = steps.reduce((last, step, index) => (step.at ? index : last), 0)
  const finished = status === 'delivered'
  return steps.map((step, index) => ({
    ...step,
    state: step.state ?? (index < lastDone || (finished && index === lastDone) ? 'done' : index === lastDone ? 'current' : 'upcoming'),
  }))
}
