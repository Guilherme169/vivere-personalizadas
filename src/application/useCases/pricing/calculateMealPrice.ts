import type { Meal } from '@/domain/meal'
import type { PricingContext, PricingRule, PricingResult } from '@/domain/pricing'
import { calculatePrice } from '@/domain/pricing'

// Thin orchestrator — separates the caller from the domain engine directly.
// If we need to add pre/post hooks (logging, caching, analytics) in V2,
// they go here without touching domain or feature code.
export const calculateMealPrice = (
  meal: Meal,
  context: PricingContext,
  rules: readonly PricingRule[],
): PricingResult => calculatePrice(meal, context, rules)
