import { defineHandler } from '@/mocks/adapter'
import { ago } from '@/mocks/fixtures/clock'
 
export const adminNotificationHandlers = [
  defineHandler('get', '/admin/notifications', () => ({
    data: {
      unreadCount: 3,
      items: [
        {
          id: 'n1',
          type: 'low_stock',
          title: 'Coconut Body Lotion is running low',
          description: '8 left in stock.',
          createdAt: ago({ minutes: 25 }),
          href: '/admin/products?stock=low',
        },
        {
          id: 'n2',
          type: 'low_stock',
          title: 'Rose Water Toner is running low',
          description: '5 left in stock.',
          createdAt: ago({ hours: 2 }),
          href: '/admin/products?stock=low',
        },
        {
          id: 'n3',
          type: 'delayed_order',
          title: '6 orders need attention',
          description: '2 are beyond the dispatch SLA.',
          createdAt: ago({ hours: 5 }),
          href: '/admin/store-operation/delayed',
        },
      ],
    },
  })),
]
