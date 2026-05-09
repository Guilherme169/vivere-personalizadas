import { ok, err, type Result } from '../shared/Result'
import { CONTAINER_CAPACITY_G, type ContainerSize } from './ContainerSize'
import { EXCLUSIVE_CATEGORIES, CATEGORY_LABEL, type IngredientCategory } from './IngredientCategory'
import type { Ingredient } from './Ingredient'
import { createMealItem, isWeightedItem, type MealItem } from './MealItem'

// ── Error types ────────────────────────────────────────────────────────────────

export type MealErrorCode =
  | 'INGREDIENT_UNAVAILABLE'
  | 'DUPLICATE_CATEGORY'
  | 'GRAMATURA_OVERFLOW'

export interface MealError {
  readonly code: MealErrorCode
  readonly message: string
}

// ── Aggregate ─────────────────────────────────────────────────────────────────

export interface Meal {
  readonly id: string
  readonly containerSize: ContainerSize
  readonly items: readonly MealItem[]
  readonly notes: string
}

export const createMeal = (containerSize: ContainerSize): Meal => ({
  id: crypto.randomUUID(),
  containerSize,
  items: [],
  notes: '',
})

// ── Computed values ────────────────────────────────────────────────────────────

export const totalGramatura = (meal: Meal): number =>
  meal.items
    .filter(isWeightedItem)
    .reduce((sum, item) => sum + item.portion.gramatura, 0)

export const containerCapacity = (meal: Meal): number =>
  CONTAINER_CAPACITY_G[meal.containerSize]

export const remainingCapacity = (meal: Meal): number =>
  Math.max(0, containerCapacity(meal) - totalGramatura(meal))

export const capacityPercent = (meal: Meal): number =>
  Math.min(100, (totalGramatura(meal) / containerCapacity(meal)) * 100)

export const hasCategory = (meal: Meal, category: IngredientCategory): boolean =>
  meal.items.some(item => item.ingredient.category === category)

export const getItemByCategory = (meal: Meal, category: IngredientCategory): MealItem | undefined =>
  meal.items.find(item => item.ingredient.category === category)

export const getItemsByCategory = (meal: Meal, category: IngredientCategory): MealItem[] =>
  meal.items.filter(item => item.ingredient.category === category)

// ── Mutations (immutable — each returns a new Meal) ───────────────────────────

export const addItem = (
  meal: Meal,
  ingredient: Ingredient,
  portionCount = 1,
): Result<Meal, MealError> => {
  if (!ingredient.isAvailable) {
    return err({
      code: 'INGREDIENT_UNAVAILABLE',
      message: `${ingredient.name} não está disponível no momento`,
    })
  }

  if (EXCLUSIVE_CATEGORIES.has(ingredient.category) && hasCategory(meal, ingredient.category)) {
    return err({
      code: 'DUPLICATE_CATEGORY',
      message: `Já existe ${CATEGORY_LABEL[ingredient.category].toLowerCase()} selecionado(a). Remova-o antes de trocar.`,
    })
  }

  const newItem = createMealItem(ingredient, portionCount)

  if (isWeightedItem(newItem)) {
    const newTotal = totalGramatura(meal) + newItem.portion.gramatura
    if (newTotal > containerCapacity(meal)) {
      return err({
        code: 'GRAMATURA_OVERFLOW',
        message: `Capacidade excedida. Disponível: ${remainingCapacity(meal)}g, necessário: ${newItem.portion.gramatura}g`,
      })
    }
  }

  return ok({ ...meal, items: [...meal.items, newItem] })
}

export const removeItem = (meal: Meal, ingredientId: string): Meal => ({
  ...meal,
  items: meal.items.filter(item => item.ingredient.id !== ingredientId),
})

export const updateItemPortion = (
  meal: Meal,
  ingredientId: string,
  portionCount: number,
): Result<Meal, MealError> => {
  const itemIndex = meal.items.findIndex(i => i.ingredient.id === ingredientId)
  if (itemIndex === -1) return ok(meal)

  const ingredient = meal.items[itemIndex].ingredient
  const updatedItem = createMealItem(ingredient, portionCount)

  if (isWeightedItem(updatedItem)) {
    const otherWeightedTotal = meal.items
      .filter((_, i) => i !== itemIndex)
      .filter(isWeightedItem)
      .reduce((sum, item) => sum + item.portion.gramatura, 0)

    const capacity = containerCapacity(meal)
    if (otherWeightedTotal + updatedItem.portion.gramatura > capacity) {
      return err({
        code: 'GRAMATURA_OVERFLOW',
        message: `Capacidade excedida. Disponível para esta porção: ${capacity - otherWeightedTotal}g`,
      })
    }
  }

  return ok({
    ...meal,
    items: meal.items.map((item, i) => (i === itemIndex ? updatedItem : item)),
  })
}

export const setNotes = (meal: Meal, notes: string): Meal => ({ ...meal, notes })

export const clearItems = (meal: Meal): Meal => ({ ...meal, items: [] })
