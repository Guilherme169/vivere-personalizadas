import type { Meal, MealError } from '@/domain/meal'
import type { PricingContext, PricingRule, PricingResult } from '@/domain/pricing'
import { updateItemPortion } from '@/domain/meal'
import { calculatePrice } from '@/domain/pricing'
import type { Result } from '@/domain/shared'
import { ok, err } from '@/domain/shared'

export interface UpdatePortionResult {
  readonly meal: Meal
  readonly pricingResult: PricingResult
}

// Updates the portion count for an existing item and recalculates pricing.
export const updatePortion = (
  meal: Meal,
  ingredientId: string,
  portionCount: number,
  context: PricingContext,
  rules: readonly PricingRule[],
): Result<UpdatePortionResult, MealError> => {
  const result = updateItemPortion(meal, ingredientId, portionCount)
  if (!result.ok) return err(result.error)

  return ok({
    meal: result.value,
    pricingResult: calculatePrice(result.value, context, rules),
  })
}
