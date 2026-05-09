import type { Meal, MealError } from '@/domain/meal'
import type { Ingredient } from '@/domain/meal'
import type { PricingContext, PricingRule, PricingResult } from '@/domain/pricing'
import { addItem } from '@/domain/meal'
import { calculatePrice } from '@/domain/pricing'
import type { Result } from '@/domain/shared'
import { ok, err } from '@/domain/shared'

export interface AddIngredientResult {
  readonly meal: Meal
  readonly pricingResult: PricingResult
}

// Atomically adds an ingredient and returns the updated meal with recalculated pricing.
// This is the primary mutation in the meal builder flow.
export const addIngredient = (
  meal: Meal,
  ingredient: Ingredient,
  context: PricingContext,
  rules: readonly PricingRule[],
  portionCount = 1,
): Result<AddIngredientResult, MealError> => {
  const result = addItem(meal, ingredient, portionCount)
  if (!result.ok) return err(result.error)

  return ok({
    meal: result.value,
    pricingResult: calculatePrice(result.value, context, rules),
  })
}
