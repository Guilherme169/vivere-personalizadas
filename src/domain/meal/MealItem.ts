import type { Ingredient } from './Ingredient'
import type { Portion } from './Portion'
import { createPortion } from './Portion'
import { WEIGHTED_CATEGORIES } from './IngredientCategory'

export interface MealItem {
  readonly ingredient: Ingredient
  readonly portion: Portion
}

export const createMealItem = (ingredient: Ingredient, portionCount = 1): MealItem => ({
  ingredient,
  portion: createPortion(ingredient, portionCount),
})

export const isWeightedItem = (item: MealItem): boolean =>
  WEIGHTED_CATEGORIES.has(item.ingredient.category)
