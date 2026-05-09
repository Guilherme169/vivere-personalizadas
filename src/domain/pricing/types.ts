import type { Money } from '../shared/Money'
import type { ContainerSize } from '../meal/ContainerSize'
import type { Meal } from '../meal/Meal'

export interface PricingConfig {
  readonly basePrices: Record<ContainerSize, Money>
  /** Future: per-tenant pricing overrides */
  readonly tenantId?: string
}

export interface PricingContext {
  readonly config: PricingConfig
}

export interface PriceAdjustment {
  readonly ruleName: string
  readonly description: string
  /** Positive = surcharge; negative = discount */
  readonly amount: Money
}

export interface PricingResult {
  readonly basePrice: Money
  readonly adjustments: readonly PriceAdjustment[]
  readonly total: Money
}

export interface PricingRule {
  readonly name: string
  calculate(meal: Meal, context: PricingContext): PriceAdjustment | null
}

export const createPricingContext = (config: PricingConfig): PricingContext => ({ config })
