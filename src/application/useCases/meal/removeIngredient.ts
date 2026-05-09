import type { Meal } from '@/domain/meal'
import type { PricingContext, PricingRule, PricingResult } from '@/domain/pricing'
import { removeItem } from '@/domain/meal'
import { calculatePrice } from '@/domain/pricing'

export interface RemoveIngredientResult {
  readonly meal: Meal
  readonly pricingResult: PricingResult
}

// Removes an ingredient and returns the updated meal with recalculated pricing.
export const removeIngredient = (
  meal: Meal,
  ingredientId: string,
  context: PricingContext,
  rules: readonly PricingRule[],
): RemoveIngredientResult => {
  const updatedMeal = removeItem(meal, ingredientId)
  return {
    meal: updatedMeal,
    pricingResult: calculatePrice(updatedMeal, context, rules),
  }
}
