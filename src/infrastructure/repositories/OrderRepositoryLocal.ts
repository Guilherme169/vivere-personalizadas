import type { Order } from '@/domain/order'
import type { OrderRepository } from '@/application/ports'

const LS_KEY = 'vivere:orders'

export const OrderRepositoryLocal: OrderRepository = {
  persist(order: Order): void {
    const existing = this.list()
    existing.push(order)
    localStorage.setItem(LS_KEY, JSON.stringify(existing))
  },

  list(): Order[] {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) return JSON.parse(raw) as Order[]
    } catch {
      // ignore
    }
    return []
  },

  clear(): void {
    localStorage.removeItem(LS_KEY)
  },
}
