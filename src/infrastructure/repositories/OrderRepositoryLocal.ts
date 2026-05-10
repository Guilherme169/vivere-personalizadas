import type { Order } from '@/domain/order'
import type { OrderRepository } from '@/application/ports'

const LS_KEY = 'vivere:orders'

export const OrderRepositoryLocal: OrderRepository = {
  async persist(order: Order): Promise<{ id: string; code: string }> {
    const existing = await this.list()
    existing.push(order)
    localStorage.setItem(LS_KEY, JSON.stringify(existing))
    return { id: order.id, code: '' }
  },

  async list(): Promise<Order[]> {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) return JSON.parse(raw) as Order[]
    } catch {
      // ignore
    }
    return []
  },

  async clear(): Promise<void> {
    localStorage.removeItem(LS_KEY)
  },

  async findLastByCustomerPhone(phone: string): Promise<Order | null> {
    const orders = await this.list()
    return orders.findLast(o => o.customer.phone === phone) ?? null
  },
}
