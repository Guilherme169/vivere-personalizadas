import type { CatalogData, IngredientRepository } from '@/application/ports'
import seedRaw from '../seed/catalog.seed.json'

const LS_KEY = 'vivere:catalog'

function parseSeed(): CatalogData {
  const s = seedRaw as {
    ingredients: CatalogData['ingredients']
    pricingDefaults: CatalogData['pricingConfig']
    compositionRules: CatalogData['compositionRules']
    customerPricingRules: CatalogData['customerPricingRules']
  }
  return {
    ingredients: s.ingredients,
    pricingConfig: s.pricingDefaults,
    compositionRules: s.compositionRules,
    customerPricingRules: s.customerPricingRules,
  }
}

export const IngredientRepositoryLocal: IngredientRepository = {
  async load(): Promise<CatalogData> {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) return JSON.parse(raw) as CatalogData
    } catch {
      // fall through to seed
    }
    return parseSeed()
  },

  async save(data: CatalogData): Promise<void> {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  },
}
