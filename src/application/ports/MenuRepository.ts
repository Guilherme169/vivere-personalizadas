import type { Ingredient } from '@/domain/meal'
import type { IngredientCategory } from '@/domain/meal'

export interface MenuRepository {
  getIngredients(): Promise<readonly Ingredient[]>
  getIngredientById(id: string): Promise<Ingredient | null>
  getIngredientsByCategory(category: IngredientCategory): Promise<readonly Ingredient[]>
  // Future: getAvailableIngredients(date: Date): Promise<readonly Ingredient[]>
  // Future: getMenuForTenant(tenantId: string): Promise<readonly Ingredient[]>
}
