import type { Money } from '../shared/Money'
import type { IngredientCategory } from './IngredientCategory'

export interface Ingredient {
  readonly id: string
  readonly name: string
  readonly category: IngredientCategory
  /** Grams per one standard portion (portionCount = 1) */
  readonly unitGramatura: number
  /** R$0 when covered by the base meal price; >0 when this item always adds to cost */
  readonly basePrice: Money
  readonly isPremium: boolean
  /** Surcharge added on top of basePrice when isPremium = true */
  readonly premiumSurcharge: Money
  readonly isAvailable: boolean
  readonly allergens: readonly string[]
  /** Searchable tags: 'vegan', 'sem-gluten', 'low-carb', 'fit', 'sem-lactose' */
  readonly tags: readonly string[]
}
