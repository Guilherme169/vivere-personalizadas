import type { Cardapio } from '@/domain/cardapio'
import type { Customer } from '@/domain/customer'

export type { Customer }
export type Fulfillment = 'entrega' | 'retirada'

export interface Order {
  id: string
  createdAt: string
  cardapios: Cardapio[]
  customer: Customer
  fulfillment: Fulfillment
  citySlug?: string
  notes?: string
}
