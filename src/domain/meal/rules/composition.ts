import type { Ingredient, Category } from '@/domain/catalog'
import type { CompositionItem } from '@/domain/cardapio'
import type { CompositionRules } from '@/domain/pricing'

const VEG_MEDLEY_ID = 'veg-medley'

function categoryCount(items: CompositionItem[], category: Category, catalog: Ingredient[]): number {
  const inCategory = items.filter(item => {
    const ing = catalog.find(i => i.id === item.ingredientId)
    return ing?.category === category
  })
  // veg-medley ocupies all vegetable slots
  if (category === 'vegetable' && inCategory.some(i => i.ingredientId === VEG_MEDLEY_ID)) {
    return Infinity
  }
  return inCategory.length
}

export function canAddItem(
  draftItems: CompositionItem[],
  ingredientId: string,
  grams: number,
  catalog: Ingredient[],
  rules: CompositionRules,
): { allowed: boolean; reason?: string } {
  const ingredient = catalog.find(i => i.id === ingredientId)
  if (!ingredient) return { allowed: false, reason: 'Ingrediente não encontrado.' }

  const cat = ingredient.category
  const maxForCat = rules.maxItemsByCategory[cat]

  // veg-medley exclusivity check
  if (cat === 'vegetable') {
    const hasVegMedley = draftItems.some(i => i.ingredientId === VEG_MEDLEY_ID)
    if (hasVegMedley) {
      return { allowed: false, reason: 'Seleta de Legumes já ocupa todos os slots de legume.' }
    }
    if (ingredientId === VEG_MEDLEY_ID) {
      const hasOtherVeg = draftItems.some(i => {
        const ing = catalog.find(ci => ci.id === i.ingredientId)
        return ing?.category === 'vegetable'
      })
      if (hasOtherVeg) {
        return { allowed: false, reason: 'Remova os outros legumes antes de selecionar a Seleta.' }
      }
    }
  }

  const count = categoryCount(draftItems, cat, catalog)
  if (count >= maxForCat) {
    return { allowed: false, reason: `Limite de ${maxForCat} item(ns) para ${cat}.` }
  }

  const alreadyAdded = draftItems.some(i => i.ingredientId === ingredientId)
  if (alreadyAdded) {
    return { allowed: false, reason: 'Ingrediente já adicionado.' }
  }

  const currentWeight = draftItems.reduce((s, i) => s + i.grams, 0)
  if (currentWeight + grams > rules.maxWeightPerMealG) {
    return { allowed: false, reason: `Peso total excederia ${rules.maxWeightPerMealG}g.` }
  }

  return { allowed: true }
}

export function totalWeight(items: CompositionItem[]): number {
  return items.reduce((s, i) => s + i.grams, 0)
}

export function suggestContainer(grams: number): 'P' | 'M' | 'G' {
  if (grams < 300) return 'P'
  if (grams <= 450) return 'M'
  return 'G'
}

export const CONTAINER_LABEL: Record<'P' | 'M' | 'G', string> = {
  P: 'Pequena (até 300g)',
  M: 'Média (300–450g)',
  G: 'Grande (451–600g)',
}

export function isCategoryFull(
  items: CompositionItem[],
  category: Category,
  catalog: Ingredient[],
  rules: CompositionRules,
): boolean {
  return categoryCount(items, category, catalog) >= rules.maxItemsByCategory[category]
}

export function categorySelectedCount(
  items: CompositionItem[],
  category: Category,
  catalog: Ingredient[],
): number {
  return items.filter(item => {
    const ing = catalog.find(i => i.id === item.ingredientId)
    return ing?.category === category
  }).length
}
