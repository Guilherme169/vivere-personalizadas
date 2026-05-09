import type { Meal } from '@/domain/meal'
import type { CompositionError } from '@/domain/meal'
import { validateComposition, isSubmittable } from '@/domain/meal'

export interface MealValidationResult {
  readonly submittable: boolean
  readonly errors: readonly CompositionError[]
}

// Full pre-submit validation. Distinct from the add-time invariant checks in
// Meal.addItem — those block impossible states; this checks business completeness.
export const validateMealForSubmit = (meal: Meal): MealValidationResult => {
  const errors = validateComposition(meal)
  return { submittable: isSubmittable(meal), errors }
}
