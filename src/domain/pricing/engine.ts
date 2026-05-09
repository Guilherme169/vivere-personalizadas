import type { Ingredient, Preparation } from '@/domain/catalog'
import type { CompositionItem, Cardapio } from '@/domain/cardapio'
import type { Fulfillment } from '@/domain/order'
import type { PricingConfig, CustomerPricingRules, MealPriceResult, OrderPricing, ItemCostBreakdown } from './types'

export function calculateItemCost(
  ingredient: Ingredient,
  preparation: Preparation,
  grams: number,
): ItemCostBreakdown {
  const finalYield = ingredient.baseYield * preparation.yieldFactor
  const costPerKgReady = ingredient.pricePerKg / finalYield
  const costPer100g = costPerKgReady / 10
  const cost = (grams / 100) * costPer100g
  return { ingredientId: ingredient.id, grams, cost, costPer100g }
}

export function calculateMealPrice(
  items: CompositionItem[],
  catalog: Ingredient[],
  config: PricingConfig,
): MealPriceResult {
  const breakdown: ItemCostBreakdown[] = items.map(item => {
    const ingredient = catalog.find(i => i.id === item.ingredientId)
    const preparation = ingredient?.preparations.find(p => p.id === item.preparationId)
    if (!ingredient || !preparation) return { ingredientId: item.ingredientId, grams: item.grams, cost: 0, costPer100g: 0 }
    return calculateItemCost(ingredient, preparation, item.grams)
  })

  const totalIngredientCost = breakdown.reduce((s, b) => s + b.cost, 0)
  const rentPerUnit = config.monthlyRent / config.monthlyVolume
  const cookCostPerUnit = (config.cooksPerShift * config.cookSalaryPerMonth) / config.monthlyVolume
  const fixedCostPerUnit = config.packaging + config.delivery + rentPerUnit + cookCostPerUnit + config.other
  const totalCost = totalIngredientCost + fixedCostPerUnit
  const suggestedPrice = totalCost * (1 + config.markupPercentage / 100)
  const finalPrice = Math.floor(suggestedPrice) + 0.99

  return { totalIngredientCost, fixedCostPerUnit, totalCost, suggestedPrice, finalPrice, items: breakdown }
}

export function calculateOrderPricing(
  cardapios: Cardapio[],
  catalog: Ingredient[],
  config: PricingConfig,
  customerRules: CustomerPricingRules,
  fulfillment: Fulfillment,
): OrderPricing {
  const cardapioResults = cardapios.map(c => ({
    finalPrice: calculateMealPrice(c.items, catalog, config).finalPrice,
    quantity: c.quantity,
  }))

  const totalUnits = cardapioResults.reduce((s, r) => s + r.quantity, 0)
  const subtotalMarmitas = cardapioResults.reduce((s, r) => s + r.finalPrice * r.quantity, 0)

  const frete =
    totalUnits >= customerRules.freeDeliveryAtTotalUnits || fulfillment === 'retirada'
      ? 0
      : customerRules.deliveryFeeBRL

  const descontoPct =
    totalUnits >= customerRules.discount10pctAtTotalUnits ? 0.1
    : totalUnits >= customerRules.discount5pctAtTotalUnits ? 0.05
    : 0

  const descontoBRL = subtotalMarmitas * descontoPct
  const totalPedido = subtotalMarmitas - descontoBRL + frete

  return { subtotalMarmitas, totalUnits, frete, descontoPct, descontoBRL, totalPedido }
}

export function formatPrice99(price: number): string {
  return `R$ ${Math.floor(price).toLocaleString('pt-BR')},99`
}

export function formatBRL(amount: number): string {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
