export { ContainerSize, CONTAINER_LABEL, CONTAINER_CAPACITY_G, ALL_CONTAINER_SIZES } from './ContainerSize'
export {
  IngredientCategory,
  CATEGORY_LABEL,
  WEIGHTED_CATEGORIES,
  EXCLUSIVE_CATEGORIES,
  REQUIRED_CATEGORIES,
} from './IngredientCategory'
export type { RequiredCategory } from './IngredientCategory'
export type { Ingredient } from './Ingredient'
export type { Portion } from './Portion'
export { createPortion } from './Portion'
export type { MealItem } from './MealItem'
export { createMealItem, isWeightedItem } from './MealItem'
export type { Meal, MealError, MealErrorCode } from './Meal'
export {
  createMeal,
  totalGramatura,
  containerCapacity,
  remainingCapacity,
  capacityPercent,
  hasCategory,
  getItemByCategory,
  getItemsByCategory,
  addItem,
  removeItem,
  updateItemPortion,
  setNotes,
  clearItems,
} from './Meal'
export type { CompositionError, CompositionErrorCode } from './rules/CompositionRules'
export { validateComposition, isSubmittable } from './rules/CompositionRules'
export { DEFAULT_GRAMATURA } from './rules/GramaturaRules'
