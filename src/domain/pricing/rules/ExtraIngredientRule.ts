import { addMoney, ZERO_MONEY } from '../../shared/Money'
import { IngredientCategory } from '../../meal/IngredientCategory'
import type { Meal } from '../../meal/Meal'
import type { PricingRule, PricingContext, PriceAdjustment } from '../types'

export const ExtraIngredientRule: PricingRule = {
  name: 'extra-ingredient',

  calculate(meal: Meal, _context: PricingContext): PriceAdjustment | null {
    const extras = meal.items.filter(
      item => item.ingredient.category === IngredientCategory.EXTRA,
    )
    if (extras.length === 0) return null

    const total = extras.reduce(
      (sum, item) => addMoney(sum, item.ingredient.basePrice),
      ZERO_MONEY,
    )

    const names = extras.map(item => item.ingredient.name).join(', ')

    return {
      ruleName: 'extra-ingredient',
      description: `Adicionais: ${names}`,
      amount: total,
    }
  },
}
