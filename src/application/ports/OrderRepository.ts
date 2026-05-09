import type { Order } from '@/domain/order'

export interface OrderRepository {
  persist(order: Order): void
  list(): Order[]
  clear(): void
}
