import { describe, it, expect } from 'vitest'
import { calculateOrderPricing } from '@/domain/pricing'
import type { Cardapio } from '@/domain/cardapio'
import type { Ingredient } from '@/domain/catalog'
import type { PricingConfig, CustomerPricingRules } from '@/domain/pricing'

const CONFIG: PricingConfig = {
  packaging: 1.61, delivery: 1.5, other: 1.0,
  monthlyRent: 1500, monthlyVolume: 1200,
  cooksPerShift: 2, cookSalaryPerMonth: 2000,
  markupPercentage: 60,
}

const RULES: CustomerPricingRules = {
  deliveryFeeBRL: 6,
  freeDeliveryAtTotalUnits: 6,
  discount5pctAtTotalUnits: 11,
  discount10pctAtTotalUnits: 16,
}

const chicken: Ingredient = {
  id: 'chicken', name: 'Frango', category: 'protein', pricePerKg: 20, baseYield: 0.9,
  preparations: [{ id: 'g', name: 'Grelhado', yieldFactor: 0.8 }], dietFlags: [],
}
const catalog = [chicken]

function cardapio(qty: number): Cardapio {
  return {
    id: `c-${qty}`,
    items: [{ ingredientId: 'chicken', preparationId: 'g', grams: 150 }],
    quantity: qty,
  }
}

describe('calculateOrderPricing', () => {
  it('charges frete when below freeDeliveryAtTotalUnits', () => {
    const result = calculateOrderPricing([cardapio(5)], catalog, CONFIG, RULES, 'entrega')
    expect(result.frete).toBe(RULES.deliveryFeeBRL)
    expect(result.totalUnits).toBe(5)
  })

  it('frete grátis at exactly freeDeliveryAtTotalUnits', () => {
    const result = calculateOrderPricing([cardapio(6)], catalog, CONFIG, RULES, 'entrega')
    expect(result.frete).toBe(0)
  })

  it('applies 5% discount at discount5pctAtTotalUnits', () => {
    const result = calculateOrderPricing([cardapio(11)], catalog, CONFIG, RULES, 'entrega')
    expect(result.descontoPct).toBe(0.05)
    expect(result.descontoBRL).toBeCloseTo(result.subtotalMarmitas * 0.05, 5)
  })

  it('retirada always has frete=0 regardless of quantity', () => {
    const result = calculateOrderPricing([cardapio(3)], catalog, CONFIG, RULES, 'retirada')
    expect(result.frete).toBe(0)
  })
})
