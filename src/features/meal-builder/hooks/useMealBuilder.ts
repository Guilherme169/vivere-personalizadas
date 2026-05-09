import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { Ingredient, ContainerSize } from '@/domain/meal'
import { createMeal } from '@/domain/meal'
import { addIngredient, removeIngredient, updatePortion } from '@/application'
import { useSessionStore } from '@/features/session/store/sessionStore'
import { usePricingStore } from '@/features/pricing/store/pricingStore'
import { useMealBuilderStore } from '../store/mealBuilderStore'

export const useMealBuilder = () => {
  const sessionData = useSessionStore((s) => s.data)

  const { meal, validationErrors, canSubmit, lastError, setMeal, setLastError, clearMeal } =
    useMealBuilderStore(
      useShallow((s) => ({
        meal: s.meal,
        validationErrors: s.validationErrors,
        canSubmit: s.canSubmit,
        lastError: s.lastError,
        setMeal: s.setMeal,
        setLastError: s.setLastError,
        clearMeal: s.clearMeal,
      })),
    )

  const setPricingResult = usePricingStore((s) => s.setResult)
  const clearPricing = usePricingStore((s) => s.clearResult)

  const startMeal = useCallback(
    (size: ContainerSize) => {
      setMeal(createMeal(size))
      clearPricing()
    },
    [setMeal, clearPricing],
  )

  const addIngredientToMeal = useCallback(
    (ingredient: Ingredient, portionCount = 1) => {
      if (!meal || !sessionData) return
      const result = addIngredient(
        meal,
        ingredient,
        sessionData.pricingContext,
        sessionData.rules,
        portionCount,
      )
      if (result.ok) {
        setMeal(result.value.meal)
        setPricingResult(result.value.pricingResult)
      } else {
        setLastError(result.error)
      }
    },
    [meal, sessionData, setMeal, setPricingResult, setLastError],
  )

  const removeIngredientFromMeal = useCallback(
    (ingredientId: string) => {
      if (!meal || !sessionData) return
      const result = removeIngredient(
        meal,
        ingredientId,
        sessionData.pricingContext,
        sessionData.rules,
      )
      setMeal(result.meal)
      setPricingResult(result.pricingResult)
    },
    [meal, sessionData, setMeal, setPricingResult],
  )

  const updateIngredientPortion = useCallback(
    (ingredientId: string, portionCount: number) => {
      if (!meal || !sessionData) return
      const result = updatePortion(
        meal,
        ingredientId,
        portionCount,
        sessionData.pricingContext,
        sessionData.rules,
      )
      if (result.ok) {
        setMeal(result.value.meal)
        setPricingResult(result.value.pricingResult)
      } else {
        setLastError(result.error)
      }
    },
    [meal, sessionData, setMeal, setPricingResult, setLastError],
  )

  const reset = useCallback(() => {
    clearMeal()
    clearPricing()
  }, [clearMeal, clearPricing])

  return {
    meal,
    validationErrors,
    canSubmit,
    lastError,
    startMeal,
    addIngredientToMeal,
    removeIngredientFromMeal,
    updateIngredientPortion,
    reset,
  }
}
