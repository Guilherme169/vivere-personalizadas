import type { Ingredient } from '@/domain/catalog'
import type { PricingConfig, CompositionRules, CustomerPricingRules } from '@/domain/pricing'

export interface CatalogData {
  ingredients: Ingredient[]
  pricingConfig: PricingConfig
  compositionRules: CompositionRules
  customerPricingRules: CustomerPricingRules
}

export interface IngredientRepository {
  load(): CatalogData
  save(data: CatalogData): void
}
