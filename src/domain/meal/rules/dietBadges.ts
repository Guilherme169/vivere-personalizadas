import type { Ingredient, DietFlag } from '@/domain/catalog'
import type { CompositionItem } from '@/domain/cardapio'

export const DIET_FLAG_LABEL: Record<DietFlag, string> = {
  'sem-gluten': 'Sem glúten',
  vegano: 'Vegano',
  vegetariano: 'Vegetariano',
  'sem-lactose': 'Sem lactose',
}

export function computeDietBadges(items: CompositionItem[], catalog: Ingredient[]): DietFlag[] {
  if (items.length === 0) return []

  const allFlags: DietFlag[] = ['sem-gluten', 'vegano', 'vegetariano', 'sem-lactose']

  return allFlags.filter(flag =>
    items.every(item => {
      const ing = catalog.find(i => i.id === item.ingredientId)
      return ing?.dietFlags.includes(flag) ?? false
    }),
  )
}
