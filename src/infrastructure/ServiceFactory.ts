import { IngredientRepositoryLocal } from './repositories/IngredientRepositoryLocal'
import { OrderRepositoryLocal } from './repositories/OrderRepositoryLocal'
import { IngredientRepositorySupabase } from './repositories/IngredientRepositorySupabase'
import { OrderRepositorySupabase } from './repositories/OrderRepositorySupabase'
import { CustomerRepositorySupabase } from './repositories/CustomerRepositorySupabase'
import { FulfillmentZoneRepositorySupabase } from './repositories/FulfillmentZoneRepositorySupabase'

const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL

export const services = {
  ingredientRepo: hasSupabase ? IngredientRepositorySupabase : IngredientRepositoryLocal,
  orderRepo: hasSupabase ? OrderRepositorySupabase : OrderRepositoryLocal,
  customerRepo: CustomerRepositorySupabase,
  zoneRepo: FulfillmentZoneRepositorySupabase,
}
