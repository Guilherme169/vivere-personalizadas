import { addMoney, ZERO_MONEY } from '../../shared/Money'
import type { Meal } from '../../meal/Meal'
import type { PricingRule, PricingContext, PriceAdjustment } from '../types'

export const PremiumIngredientRule: PricingRule = {
  name: 'premium-ingredient',

  calculate(meal: Meal, _context: PricingContext): PriceAdjustment | null {
    const premiumItems = meal.items.filter(item => item.ingredient.isPremium)
    if (premiumItems.length === 0) return null

    const total = premiumItems.reduce(
      (sum, item) => addMoney(sum, item.ingredient.premiumSurcharge),
      ZERO_MONEY,
    )

    const names = premiumItems.map(item => item.ingredient.name).join(', ')

    return {
      ruleName: 'premium-ingredient',
      description: `Premium: ${names}`,
      amount: total,
    }
  },
}
