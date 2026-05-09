import type { PricingRule } from '@/domain/pricing'
import { PremiumIngredientRule, ExtraPortionRule, ExtraIngredientRule } from '@/domain/pricing'

// Synchronous convenience for tests and for callers that already have rules in hand.
// In production, rules come from PricingRepository.getActiveRules() (via bootstrapSession).
// This file imports only from domain — no infrastructure coupling.
export const DEFAULT_PRICING_RULES: readonly PricingRule[] = [
  PremiumIngredientRule,
  ExtraPortionRule,
  ExtraIngredientRule,
]
