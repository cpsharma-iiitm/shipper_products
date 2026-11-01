import { endpoints, http } from '@/app/services'

/**
 * ASSUMPTION — confirm with backend team. Expected response:
 *   { unreadCount, items: [{ id, type: 'low_stock' | 'delayed_order' | 'new_order', title, description, createdAt, href }] }
 */
export async function getNotifications() {
  const { data } = await http.get(endpoints.admin.notifications)
  return data
}
