import { defineHandler } from '@/mocks/adapter'
import { SERVICEABLE_PINS, SHIPPING_METHOD } from '@/mocks/fixtures/serviceability'
import { fromNow } from '@/mocks/fixtures/clock'

export const serviceabilityHandlers = [
  defineHandler('get', '/serviceability', ({ query }) => {
    const area = SERVICEABLE_PINS[query.pin]
    if (!area) return { data: { pin: query.pin, serviceable: false } }
    return {
      data: {
        pin: query.pin,
        serviceable: true,
        shippingMethod: SHIPPING_METHOD,
        ...area,
        etaFrom: fromNow({ days: area.etaMinDays }),
        etaTo: fromNow({ days: area.etaMaxDays }),
      },
    }
  }),
]
