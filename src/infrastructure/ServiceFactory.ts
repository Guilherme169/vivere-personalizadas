import { IngredientRepositoryLocal } from './repositories/IngredientRepositoryLocal'
import { OrderRepositoryLocal } from './repositories/OrderRepositoryLocal'
import { IngredientRepositorySupabase } from './repositories/IngredientRepositorySupabase'
import { OrderRepositorySupabase } from './repositories/OrderRepositorySupabase'

const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL

export const services = {
  ingredientRepo: hasSupabase ? IngredientRepositorySupabase : IngredientRepositoryLocal,
  orderRepo: hasSupabase ? OrderRepositorySupabase : OrderRepositoryLocal,
}
