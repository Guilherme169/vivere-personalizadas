import type { Order } from '@/domain/order'

export interface OrderRepository {
  persist(order: Order): Promise<void>
  list(): Promise<Order[]>
  clear(): Promise<void>
  findLastByCustomerPhone(phone: string): Promise<Order | null>
}
