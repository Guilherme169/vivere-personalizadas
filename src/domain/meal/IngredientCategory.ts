export const IngredientCategory = {
  PROTEIN: 'protein',
  CARB: 'carb',
  LEGUME: 'legume',       // feijão, lentilha, grão-de-bico
  VEGETABLE: 'vegetable', // legumes e verduras cozidos
  SALAD: 'salad',         // folhas frescas — não conta no peso total
  SAUCE: 'sauce',         // molhos — não conta no peso total
  EXTRA: 'extra',         // adicionais cobrados à parte
} as const

export type IngredientCategory = (typeof IngredientCategory)[keyof typeof IngredientCategory]

export const CATEGORY_LABEL: Record<IngredientCategory, string> = {
  protein: 'Proteína',
  carb: 'Carboidrato',
  legume: 'Feijão / Leguminosa',
  vegetable: 'Legumes e Verduras',
  salad: 'Salada',
  sauce: 'Molho',
  extra: 'Adicional',
}

// These categories count toward the container weight limit
export const WEIGHTED_CATEGORIES = new Set<IngredientCategory>([
  IngredientCategory.PROTEIN,
  IngredientCategory.CARB,
  IngredientCategory.LEGUME,
  IngredientCategory.VEGETABLE,
])

// Only one distinct ingredient allowed per exclusive category;
// a second portion of the same ingredient uses portionCount > 1
export const EXCLUSIVE_CATEGORIES = new Set<IngredientCategory>([
  IngredientCategory.PROTEIN,
  IngredientCategory.CARB,
  IngredientCategory.LEGUME,
])

// All must be present before the meal can be submitted
export const REQUIRED_CATEGORIES = [
  IngredientCategory.PROTEIN,
  IngredientCategory.CARB,
  IngredientCategory.VEGETABLE,
] as const

export type RequiredCategory = (typeof REQUIRED_CATEGORIES)[number]
