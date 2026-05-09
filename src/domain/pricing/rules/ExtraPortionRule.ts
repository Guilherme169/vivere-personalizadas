import { addMoney, multiplyMoney, ZERO_MONEY } from '../../shared/Money'
import type { Meal } from '../../meal/Meal'
import type { PricingRule, PricingContext, PriceAdjustment } from '../types'

export const ExtraPortionRule: PricingRule = {
  name: 'extra-portion',

  calculate(meal: Meal, _context: PricingContext): PriceAdjustment | null {
    const extraPortionItems = meal.items.filter(item => item.portion.portionCount > 1)
    if (extraPortionItems.length === 0) return null

    const total = extraPortionItems.reduce((sum, item) => {
      const extraPortions = item.portion.portionCount - 1
      return addMoney(sum, multiplyMoney(item.ingredient.basePrice, extraPortions))
    }, ZERO_MONEY)

    const names = extraPortionItems
      .map(item => `${item.ingredient.name} ×${item.portion.portionCount}`)
      .join(', ')

    return {
      ruleName: 'extra-portion',
      description: `Porção extra: ${names}`,
      amount: total,
    }
  },
}
