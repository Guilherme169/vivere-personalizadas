import { addMoney } from '../shared/Money'
import type { Meal } from '../meal/Meal'
import type { PricingContext, PricingResult, PricingRule, PriceAdjustment } from './types'

export const calculatePrice = (
  meal: Meal,
  context: PricingContext,
  rules: readonly PricingRule[],
): PricingResult => {
  const basePrice = context.config.basePrices[meal.containerSize]

  const adjustments = rules
    .map(rule => rule.calculate(meal, context))
    .filter((adj): adj is PriceAdjustment => adj !== null)

  const total = adjustments.reduce((sum, adj) => addMoney(sum, adj.amount), basePrice)

  return { basePrice, adjustments, total }
}
