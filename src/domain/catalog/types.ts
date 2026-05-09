export type Category = 'protein' | 'carb' | 'vegetable' | 'seasoning' | 'dairy' | 'other'

export type DietFlag = 'sem-gluten' | 'vegano' | 'vegetariano' | 'sem-lactose'

export interface Preparation {
  id: string
  name: string
  yieldFactor: number
}

export interface Ingredient {
  id: string
  name: string
  category: Category
  pricePerKg: number
  baseYield: number
  preparations: Preparation[]
  dietFlags: DietFlag[]
}

export const CATEGORY_LABEL: Record<Category, string> = {
  protein: 'Proteínas',
  carb: 'Carboidratos',
  vegetable: 'Legumes e verduras',
  seasoning: 'Temperos',
  dairy: 'Laticínios',
  other: 'Outros',
}

