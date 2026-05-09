import { describe, it, expect } from 'vitest'
import { calculateItemCost, calculateMealPrice } from '@/domain/pricing'
import type { Ingredient } from '@/domain/catalog'
import type { CompositionItem } from '@/domain/cardapio'
import type { PricingConfig } from '@/domain/pricing'

const CONFIG: PricingConfig = {
  packaging: 1.61,
  delivery: 1.5,
  other: 1.0,
  monthlyRent: 1500,
  monthlyVolume: 1200,
  cooksPerShift: 2,
  cookSalaryPerMonth: 2000,
  markupPercentage: 60,
}

const chicken: Ingredient = {
  id: 'chicken',
  name: 'Frango filé',
  category: 'protein',
  pricePerKg: 20,
  baseYield: 0.9,
  preparations: [{ id: 'grilled', name: 'Grelhado', yieldFactor: 0.8 }],
  dietFlags: ['sem-gluten', 'sem-lactose'],
}

const rice: Ingredient = {
  id: 'rice',
  name: 'Arroz branco',
  category: 'carb',
  pricePerKg: 5,
  baseYield: 1.0,
  preparations: [{ id: 'cooked', name: 'Cozido', yieldFactor: 2.5 }],
  dietFlags: ['sem-gluten', 'sem-lactose', 'vegano', 'vegetariano'],
}

describe('calculateItemCost', () => {
  it('computes cost correctly for chicken 150g', () => {
    const prep = chicken.preparations[0]!
    // finalYield = 0.9 * 0.8 = 0.72
    // costPerKgReady = 20 / 0.72 ≈ 27.778
    // costPer100g = 27.778 / 10 ≈ 2.778
    // cost = (150/100) * 2.778 ≈ 4.167
    const result = calculateItemCost(chicken, prep, 150)
    expect(result.ingredientId).toBe('chicken')
    expect(result.grams).toBe(150)
    expect(result.cost).toBeCloseTo(4.167, 2)
  })

  it('rice has lower cost than chicken per 100g due to yield/price', () => {
    const chickenPrep = chicken.preparations[0]!
    const ricePrep = rice.preparations[0]!
    const chickenCost = calculateItemCost(chicken, chickenPrep, 100)
    const riceCost = calculateItemCost(rice, ricePrep, 100)
    expect(riceCost.costPer100g).toBeLessThan(chickenCost.costPer100g)
  })

  it('cost scales linearly with grams', () => {
    const prep = chicken.preparations[0]!
    const cost100 = calculateItemCost(chicken, prep, 100).cost
    const cost200 = calculateItemCost(chicken, prep, 200).cost
    expect(cost200).toBeCloseTo(cost100 * 2, 10)
  })

  it('high yield factor (rice cooks to 2.5x) reduces cost per ready gram', () => {
    const prep = rice.preparations[0]!
    // finalYield = 1.0 * 2.5 = 2.5
    // costPerKgReady = 5 / 2.5 = 2
    // costPer100g = 0.2
    const result = calculateItemCost(rice, prep, 100)
    expect(result.costPer100g).toBeCloseTo(0.2, 5)
  })
})

describe('calculateMealPrice', () => {
  const items: CompositionItem[] = [
    { ingredientId: 'chicken', preparationId: 'grilled', grams: 150 },
    { ingredientId: 'rice', preparationId: 'cooked', grams: 100 },
  ]
  const catalog = [chicken, rice]

  it('final price is floor(suggestedPrice) + 0.99', () => {
    const result = calculateMealPrice(items, catalog, CONFIG)
    expect(result.finalPrice).toBeCloseTo(Math.floor(result.suggestedPrice) + 0.99, 5)
  })

  it('unknown ingredient contributes 0 cost', () => {
    const ghostItems: CompositionItem[] = [{ ingredientId: 'ghost', preparationId: 'x', grams: 100 }]
    const result = calculateMealPrice(ghostItems, catalog, CONFIG)
    expect(result.totalIngredientCost).toBe(0)
  })
})
