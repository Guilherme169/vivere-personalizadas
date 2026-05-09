export type { Customer } from './Customer'
export { emptyCustomer } from './Customer'
export { OrderStatus } from './OrderStatus'
export type { DraftMealEntry, OrderDraft } from './OrderDraft'
export {
  createOrderDraft,
  addMealToOrder,
  removeMealFromOrder,
  updateOrderCustomer,
  setOrderNotes,
  orderTotal,
  isOrderEmpty,
} from './OrderDraft'
