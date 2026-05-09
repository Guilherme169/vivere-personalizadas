import { IngredientRepositoryLocal } from './repositories/IngredientRepositoryLocal'
import { OrderRepositoryLocal } from './repositories/OrderRepositoryLocal'

export const services = {
  ingredientRepo: IngredientRepositoryLocal,
  orderRepo: OrderRepositoryLocal,
}
