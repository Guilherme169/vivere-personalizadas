import { addMoney, ZERO_MONEY, type Money } from '../shared/Money'
import type { Meal } from '../meal/Meal'
import type { PricingResult } from '../pricing/types'
import type { Customer } from './Customer'

export interface DraftMealEntry {
  readonly meal: Meal
  readonly pricingResult: PricingResult
}

export interface OrderDraft {
  readonly id: string
  readonly customer: Customer
  readonly meals: readonly DraftMealEntry[]
  readonly deliveryNotes: string
  readonly createdAt: Date
}

export const createOrderDraft = (): OrderDraft => ({
  id: crypto.randomUUID(),
  customer: { name: '', phone: '' },
  meals: [],
  deliveryNotes: '',
  createdAt: new Date(),
})

export const addMealToOrder = (draft: OrderDraft, entry: DraftMealEntry): OrderDraft => ({
  ...draft,
  meals: [...draft.meals, entry],
})

export const removeMealFromOrder = (draft: OrderDraft, mealId: string): OrderDraft => ({
  ...draft,
  meals: draft.meals.filter(entry => entry.meal.id !== mealId),
})

export const updateOrderCustomer = (draft: OrderDraft, customer: Customer): OrderDraft => ({
  ...draft,
  customer,
})

export const setOrderNotes = (draft: OrderDraft, deliveryNotes: string): OrderDraft => ({
  ...draft,
  deliveryNotes,
})

export const orderTotal = (draft: OrderDraft): Money =>
  draft.meals.reduce((sum, entry) => addMoney(sum, entry.pricingResult.total), ZERO_MONEY)

export const isOrderEmpty = (draft: OrderDraft): boolean => draft.meals.length === 0
