import { describe, it, expect } from 'vitest'
import { canAddItem } from '@/domain/meal'
import type { CompositionItem } from '@/domain/cardapio'
import type { Ingredient } from '@/domain/catalog'
import type { CompositionRules } from '@/domain/pricing'

const RULES: CompositionRules = {
  minWeightPerMealG: 200,
  maxWeightPerMealG: 600,
  maxItemsByCategory: { protein: 1, carb: 2, vegetable: 3, seasoning: 1, dairy: 1, other: 2 },
  minMealsPerCardapio: 5,
}

const chicken: Ingredient = {
  id: 'chicken', name: 'Frango', category: 'protein', pricePerKg: 20, baseYield: 0.9,
  preparations: [{ id: 'g', name: 'Grelhado', yieldFactor: 0.8 }], dietFlags: [],
}
const fish: Ingredient = {
  id: 'fish', name: 'Peixe', category: 'protein', pricePerKg: 30, baseYield: 0.85,
  preparations: [{ id: 'b', name: 'Ao forno', yieldFactor: 0.9 }], dietFlags: [],
}
const broccoli: Ingredient = {
  id: 'broccoli', name: 'Brócolis', category: 'vegetable', pricePerKg: 8, baseYield: 0.95,
  preparations: [{ id: 's', name: 'Cozido', yieldFactor: 1 }], dietFlags: [],
}
const vegMedley: Ingredient = {
  id: 'veg-medley', name: 'Seleta de Legumes', category: 'vegetable', pricePerKg: 10, baseYield: 0.95,
  preparations: [{ id: 'frozen', name: 'Congelada', yieldFactor: 1 }], dietFlags: [],
}
const catalog = [chicken, fish, broccoli, vegMedley]

describe('canAddItem – category limits', () => {
  it('allows first protein', () => {
    expect(canAddItem([], 'chicken', 150, catalog, RULES).allowed).toBe(true)
  })

  it('blocks second protein when limit is 1', () => {
    const draft: CompositionItem[] = [{ ingredientId: 'chicken', preparationId: 'g', grams: 150 }]
    const result = canAddItem(draft, 'fish', 150, catalog, RULES)
    expect(result.allowed).toBe(false)
  })

  it('blocks duplicate ingredient', () => {
    const draft: CompositionItem[] = [{ ingredientId: 'broccoli', preparationId: 's', grams: 100 }]
    const result = canAddItem(draft, 'broccoli', 100, catalog, RULES)
    expect(result.allowed).toBe(false)
  })
})

describe('canAddItem – weight limits', () => {
  it('blocks when adding would exceed maxWeightPerMealG', () => {
    const draft: CompositionItem[] = [{ ingredientId: 'chicken', preparationId: 'g', grams: 500 }]
    const result = canAddItem(draft, 'broccoli', 150, catalog, RULES)
    expect(result.allowed).toBe(false)
  })
})

describe('canAddItem – veg-medley exclusivity', () => {
  it('blocks adding veg-medley when another vegetable is already present', () => {
    const draft: CompositionItem[] = [{ ingredientId: 'broccoli', preparationId: 's', grams: 100 }]
    const result = canAddItem(draft, 'veg-medley', 150, catalog, RULES)
    expect(result.allowed).toBe(false)
  })

  it('blocks adding a vegetable when veg-medley is already present', () => {
    const draft: CompositionItem[] = [{ ingredientId: 'veg-medley', preparationId: 'frozen', grams: 150 }]
    const result = canAddItem(draft, 'broccoli', 100, catalog, RULES)
    expect(result.allowed).toBe(false)
  })
})
