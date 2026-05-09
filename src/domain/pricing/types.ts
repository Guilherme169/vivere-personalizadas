import type { Category } from '@/domain/catalog'

export interface PricingConfig {
  packaging: number
  delivery: number
  other: number
  monthlyRent: number
  monthlyVolume: number
  cooksPerShift: number
  cookSalaryPerMonth: number
  markupPercentage: number
}

export interface CompositionRules {
  minWeightPerMealG: number
  maxWeightPerMealG: number
  maxItemsByCategory: Record<Category, number>
  minMealsPerCardapio: number
}

export interface CustomerPricingRules {
  deliveryFeeBRL: number
  freeDeliveryAtTotalUnits: number
  discount5pctAtTotalUnits: number
  discount10pctAtTotalUnits: number
}

export interface ItemCostBreakdown {
  ingredientId: string
  grams: number
  cost: number
  costPer100g: number
}

export interface MealPriceResult {
  totalIngredientCost: number
  fixedCostPerUnit: number
  totalCost: number
  suggestedPrice: number
  finalPrice: number
  items: ItemCostBreakdown[]
}

export interface OrderPricing {
  subtotalMarmitas: number
  totalUnits: number
  frete: number
  descontoPct: number
  descontoBRL: number
  totalPedido: number
}
