import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Meal, MealError, CompositionError } from '@/domain/meal'
import { validateComposition, isSubmittable } from '@/domain/meal'

interface MealBuilderState {
  meal: Meal | null
  validationErrors: readonly CompositionError[]
  canSubmit: boolean
  lastError: MealError | null
  setMeal: (meal: Meal) => void
  setLastError: (error: MealError | null) => void
  clearMeal: () => void
}

export const useMealBuilderStore = create<MealBuilderState>()(
  devtools(
    (set) => ({
      meal: null,
      validationErrors: [],
      canSubmit: false,
      lastError: null,

      setMeal: (meal) =>
        set(
          {
            meal,
            validationErrors: validateComposition(meal),
            canSubmit: isSubmittable(meal),
            lastError: null,
          },
          false,
          'mealBuilder/setMeal',
        ),

      setLastError: (lastError) => set({ lastError }, false, 'mealBuilder/setLastError'),

      clearMeal: () =>
        set(
          { meal: null, validationErrors: [], canSubmit: false, lastError: null },
          false,
          'mealBuilder/clearMeal',
        ),
    }),
    { name: 'MealBuilderStore' },
  ),
)
