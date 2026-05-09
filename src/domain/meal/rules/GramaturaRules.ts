import { ContainerSize } from '../ContainerSize'
import { IngredientCategory } from '../IngredientCategory'

// Reference table for default ingredient unitGramatura values.
// Used as a guide when seeding the menu configuration.
// The actual capacity enforcement (totalGramatura ≤ capacity) lives in Meal.addItem.
export const DEFAULT_GRAMATURA: Partial<
  Record<IngredientCategory, Record<ContainerSize, number>>
> = {
  [IngredientCategory.PROTEIN]: {
    [ContainerSize.SMALL]: 120,
    [ContainerSize.MEDIUM]: 150,
    [ContainerSize.LARGE]: 180,
    [ContainerSize.EXTRA_LARGE]: 220,
  },
  [IngredientCategory.CARB]: {
    [ContainerSize.SMALL]: 150,
    [ContainerSize.MEDIUM]: 180,
    [ContainerSize.LARGE]: 220,
    [ContainerSize.EXTRA_LARGE]: 260,
  },
  [IngredientCategory.LEGUME]: {
    [ContainerSize.SMALL]: 60,
    [ContainerSize.MEDIUM]: 60,
    [ContainerSize.LARGE]: 80,
    [ContainerSize.EXTRA_LARGE]: 80,
  },
}
