import type { Meal } from '@/domain/meal'
import type { PricingContext, PricingRule } from '@/domain/pricing'
import type { DraftMealEntry } from '@/domain/order'
import { calculatePrice } from '@/domain/pricing'

// Seals a finished Meal into an immutable DraftMealEntry by computing its
// final price. Once sealed, price won't drift if config changes mid-session.
export const createOrderEntry = (
  meal: Meal,
  context: PricingContext,
  rules: readonly PricingRule[],
): DraftMealEntry => ({
  meal,
  pricingResult: calculatePrice(meal, context, rules),
})
