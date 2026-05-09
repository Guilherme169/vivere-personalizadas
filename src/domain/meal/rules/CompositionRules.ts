import { IngredientCategory } from '../IngredientCategory'
import type { Meal } from '../Meal'

export type CompositionErrorCode =
  | 'MISSING_PROTEIN'
  | 'MISSING_CARB'
  | 'MISSING_VEGETABLE'

export interface CompositionError {
  readonly code: CompositionErrorCode
  readonly message: string
}

const REQUIRED: Array<{ category: IngredientCategory; code: CompositionErrorCode; message: string }> = [
  { category: IngredientCategory.PROTEIN, code: 'MISSING_PROTEIN', message: 'Adicione uma proteína' },
  { category: IngredientCategory.CARB, code: 'MISSING_CARB', message: 'Adicione um carboidrato' },
  { category: IngredientCategory.VEGETABLE, code: 'MISSING_VEGETABLE', message: 'Adicione pelo menos um legume ou verdura' },
]

export const validateComposition = (meal: Meal): CompositionError[] =>
  REQUIRED
    .filter(({ category }) => !meal.items.some(item => item.ingredient.category === category))
    .map(({ code, message }) => ({ code, message }))

export const isSubmittable = (meal: Meal): boolean =>
  validateComposition(meal).length === 0
