import type { Ingredient } from './Ingredient'

export interface Portion {
  readonly portionCount: number  // 1 = standard; 2 = double
  readonly gramatura: number     // portionCount × ingredient.unitGramatura
}

export const createPortion = (ingredient: Ingredient, portionCount: number): Portion => ({
  portionCount,
  gramatura: Math.round(portionCount * ingredient.unitGramatura),
})
