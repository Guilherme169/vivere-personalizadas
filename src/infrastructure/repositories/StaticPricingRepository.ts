import type { PricingRepository } from '@/application/ports/PricingRepository'
import type { PricingConfig, PricingRule } from '@/domain/pricing'
import { PremiumIngredientRule, ExtraPortionRule, ExtraIngredientRule } from '@/domain/pricing'
import { VIVERE_PRICING_CONFIG } from '../config/pricing.config'

// Infrastructure composes domain rule instances into the active set.
// In V3 SaaS, load active rule IDs from DB per tenant and resolve here.
const ACTIVE_RULES: readonly PricingRule[] = [
  PremiumIngredientRule,
  ExtraPortionRule,
  ExtraIngredientRule,
]

export class StaticPricingRepository implements PricingRepository {
  async getPricingConfig(): Promise<PricingConfig> {
    return VIVERE_PRICING_CONFIG
  }

  async getActiveRules(): Promise<readonly PricingRule[]> {
    return ACTIVE_RULES
  }
}
