export const OrderStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',         // sent via WhatsApp
  CONFIRMED: 'confirmed',         // operator acknowledged
  IN_PRODUCTION: 'in_production',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]
