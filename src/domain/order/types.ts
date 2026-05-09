import type { Cardapio } from '@/domain/cardapio'

export interface Customer {
  name: string
  phone: string
  address?: string
}

export type Fulfillment = 'entrega' | 'retirada'

export interface Order {
  id: string
  createdAt: string
  cardapios: Cardapio[]
  customer: Customer
  fulfillment: Fulfillment
  notes?: string
}
