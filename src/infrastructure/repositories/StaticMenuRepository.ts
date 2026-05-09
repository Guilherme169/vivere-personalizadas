import type { MenuRepository } from '@/application/ports/MenuRepository'
import type { Ingredient } from '@/domain/meal'
import type { IngredientCategory } from '@/domain/meal'
import { VIVERE_MENU } from '../config/menu.config'

// Reads from the static JSON config. Replace with ApiMenuRepository in V2
// without changing any application or domain code.
export class StaticMenuRepository implements MenuRepository {
  async getIngredients(): Promise<readonly Ingredient[]> {
    return VIVERE_MENU.ingredients
  }

  async getIngredientById(id: string): Promise<Ingredient | null> {
    return VIVERE_MENU.ingredients.find(i => i.id === id) ?? null
  }

  async getIngredientsByCategory(category: IngredientCategory): Promise<readonly Ingredient[]> {
    return VIVERE_MENU.ingredients.filter(i => i.category === category)
  }
}
