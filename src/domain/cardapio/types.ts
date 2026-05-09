export interface CompositionItem {
  ingredientId: string
  preparationId: string
  grams: number
}

export interface Cardapio {
  id: string
  items: CompositionItem[]
  quantity: number
}
