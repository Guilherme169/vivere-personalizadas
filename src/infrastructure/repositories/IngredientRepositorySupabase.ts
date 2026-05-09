import type { CatalogData, IngredientRepository } from '@/application/ports'
import type { Ingredient } from '@/domain/catalog'
import type { PricingConfig, CompositionRules, CustomerPricingRules } from '@/domain/pricing'
import { supabase } from '../supabase/client'

type DbIngredient = {
  external_id: string
  name: string
  category: string
  price_per_kg: number
  base_yield: number
  preparations: Ingredient['preparations']
  diet_flags: string[]
}

function toDomain(row: DbIngredient): Ingredient {
  return {
    id: row.external_id,
    name: row.name,
    category: row.category as Ingredient['category'],
    pricePerKg: row.price_per_kg,
    baseYield: row.base_yield,
    preparations: row.preparations,
    dietFlags: row.diet_flags as Ingredient['dietFlags'],
  }
}

export const IngredientRepositorySupabase: IngredientRepository = {
  async load(): Promise<CatalogData> {
    const [ingredientsRes, settingsRes] = await Promise.all([
      supabase
        .from('ingredients')
        .select('external_id, name, category, price_per_kg, base_yield, preparations, diet_flags')
        .order('position')
        .order('name'),
      supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['pricing_config', 'composition_rules', 'customer_pricing_rules']),
    ])

    if (ingredientsRes.error) throw ingredientsRes.error
    if (settingsRes.error) throw settingsRes.error

    const settings = Object.fromEntries(
      (settingsRes.data ?? []).map(r => [r.key, r.value])
    )

    return {
      ingredients: (ingredientsRes.data ?? []).map(toDomain),
      pricingConfig: settings['pricing_config'] as PricingConfig,
      compositionRules: settings['composition_rules'] as CompositionRules,
      customerPricingRules: settings['customer_pricing_rules'] as CustomerPricingRules,
    }
  },

  async save(data: CatalogData): Promise<void> {
    const ingredientRows = data.ingredients.map((ing, i) => ({
      external_id: ing.id,
      name: ing.name,
      category: ing.category,
      price_per_kg: ing.pricePerKg,
      base_yield: ing.baseYield,
      preparations: ing.preparations,
      diet_flags: ing.dietFlags,
      active: true,
      position: i,
    }))

    const [ingredientsRes, settingsRes] = await Promise.all([
      supabase
        .from('ingredients')
        .upsert(ingredientRows, { onConflict: 'external_id' }),
      supabase
        .from('app_settings')
        .upsert(
          [
            { key: 'pricing_config', value: data.pricingConfig },
            { key: 'composition_rules', value: data.compositionRules },
            { key: 'customer_pricing_rules', value: data.customerPricingRules },
          ],
          { onConflict: 'key' }
        ),
    ])

    if (ingredientsRes.error) throw ingredientsRes.error
    if (settingsRes.error) throw settingsRes.error
  },
}
