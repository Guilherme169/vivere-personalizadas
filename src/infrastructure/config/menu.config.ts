import type { Ingredient } from '@/domain/meal'
import { IngredientCategory } from '@/domain/meal'
import { ZERO_MONEY, moneyFromReais } from '@/domain/shared'

export interface MenuConfig {
  readonly tenantId: string
  readonly version: string
  readonly lastUpdated: string
  readonly ingredients: readonly Ingredient[]
}

// Helper to reduce verbosity in the catalog definition
function ing(
  id: string,
  name: string,
  category: IngredientCategory,
  unitGramatura: number,
  opts: Partial<
    Pick<Ingredient, 'basePrice' | 'isPremium' | 'premiumSurcharge' | 'isAvailable' | 'allergens' | 'tags'>
  > = {},
): Ingredient {
  return {
    id,
    name,
    category,
    unitGramatura,
    basePrice: ZERO_MONEY,
    isPremium: false,
    premiumSurcharge: ZERO_MONEY,
    isAvailable: true,
    allergens: [],
    tags: [],
    ...opts,
  }
}

// ── Catalog ───────────────────────────────────────────────────────────────────
// unitGramatura = standard portion for a Medium (M) container.
// Vegetables fill the remaining capacity; their unitGramatura is per-item addition.

const PROTEINS: Ingredient[] = [
  ing('frango-grelhado', 'Frango Grelhado', IngredientCategory.PROTEIN, 150, {
    tags: ['sem-lactose', 'sem-gluten'],
  }),
  ing('frango-ervas', 'Frango com Ervas Finas', IngredientCategory.PROTEIN, 150, {
    tags: ['sem-lactose', 'sem-gluten'],
  }),
  ing('carne-moida', 'Carne Moída Temperada', IngredientCategory.PROTEIN, 150, {
    tags: ['sem-gluten'],
  }),
  ing('bife-acebolado', 'Bife Acebolado', IngredientCategory.PROTEIN, 150, {
    tags: ['sem-gluten'],
  }),
  ing('file-tilapia', 'Filé de Tilápia Grelhado', IngredientCategory.PROTEIN, 150, {
    tags: ['sem-lactose', 'sem-gluten'],
  }),
  ing('omelete-ervas', 'Omelete de Ervas', IngredientCategory.PROTEIN, 120, {
    tags: ['vegetariano', 'sem-gluten'],
  }),
  ing('salmon-grelhado', 'Salmão Grelhado', IngredientCategory.PROTEIN, 150, {
    isPremium: true,
    premiumSurcharge: moneyFromReais(8),
    tags: ['sem-lactose', 'sem-gluten', 'premium'],
  }),
  ing('picanha-assada', 'Picanha Assada', IngredientCategory.PROTEIN, 150, {
    isPremium: true,
    premiumSurcharge: moneyFromReais(10),
    tags: ['sem-gluten', 'premium'],
  }),
]

const CARBS: Ingredient[] = [
  ing('arroz-branco', 'Arroz Branco', IngredientCategory.CARB, 180, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('arroz-integral', 'Arroz Integral', IngredientCategory.CARB, 180, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('arroz-brocolis', 'Arroz com Brócolis', IngredientCategory.CARB, 180, {
    tags: ['vegan'],
  }),
  ing('macarrao-alho', 'Macarrão ao Alho e Óleo', IngredientCategory.CARB, 180, {
    allergens: ['gluten'],
  }),
  ing('batata-doce', 'Batata Doce Assada', IngredientCategory.CARB, 180, {
    tags: ['vegan', 'sem-gluten', 'low-carb'],
  }),
  ing('pure-mandioquinha', 'Purê de Mandioquinha', IngredientCategory.CARB, 180, {
    tags: ['vegetariano', 'sem-gluten'],
  }),
]

const LEGUMES: Ingredient[] = [
  ing('feijao-preto', 'Feijão Preto', IngredientCategory.LEGUME, 60, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('feijao-carioca', 'Feijão Carioca', IngredientCategory.LEGUME, 60, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('lentilha', 'Lentilha Temperada', IngredientCategory.LEGUME, 60, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('grao-de-bico', 'Grão-de-Bico Refogado', IngredientCategory.LEGUME, 60, {
    tags: ['vegan', 'sem-gluten'],
  }),
]

const VEGETABLES: Ingredient[] = [
  ing('brocolis-alho', 'Brócolis no Alho', IngredientCategory.VEGETABLE, 80, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('cenoura-refogada', 'Cenoura Refogada', IngredientCategory.VEGETABLE, 80, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('abobrinha', 'Abobrinha Sauté', IngredientCategory.VEGETABLE, 80, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('chuchu', 'Chuchu Refogado', IngredientCategory.VEGETABLE, 80, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('vagem', 'Vagem Sauté', IngredientCategory.VEGETABLE, 80, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('couve', 'Couve Refogada', IngredientCategory.VEGETABLE, 80, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('espinafre', 'Espinafre Refogado', IngredientCategory.VEGETABLE, 80, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('berinjela', 'Berinjela Assada', IngredientCategory.VEGETABLE, 80, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('mix-legumes', 'Mix de Legumes do Dia', IngredientCategory.VEGETABLE, 80, {
    tags: ['vegan', 'sem-gluten'],
  }),
]

const SALADS: Ingredient[] = [
  ing('alface-rucula', 'Alface e Rúcula', IngredientCategory.SALAD, 30, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('mix-folhas', 'Mix de Folhas', IngredientCategory.SALAD, 30, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('tomate-cereja', 'Tomate Cereja', IngredientCategory.SALAD, 50, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('pepino-cenoura', 'Pepino e Cenoura Ralada', IngredientCategory.SALAD, 40, {
    tags: ['vegan', 'sem-gluten'],
  }),
]

const SAUCES: Ingredient[] = [
  ing('vinagrete', 'Vinagrete', IngredientCategory.SAUCE, 30, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('azeite-limao', 'Azeite com Limão', IngredientCategory.SAUCE, 15, {
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('molho-tahine', 'Molho Tahine', IngredientCategory.SAUCE, 30, {
    allergens: ['sesamo'],
    tags: ['vegan', 'sem-gluten'],
  }),
  ing('shoyu-light', 'Shoyu Light', IngredientCategory.SAUCE, 15, {
    allergens: ['soja'],
  }),
]

const EXTRAS: Ingredient[] = [
  ing('ovo-cozido', 'Ovo Cozido', IngredientCategory.EXTRA, 60, {
    basePrice: moneyFromReais(2),
    tags: ['sem-gluten', 'sem-lactose'],
  }),
  ing('queijo-cottage', 'Queijo Cottage', IngredientCategory.EXTRA, 50, {
    basePrice: moneyFromReais(3),
    allergens: ['lactose'],
    tags: ['vegetariano', 'sem-gluten'],
  }),
  ing('amendoim', 'Amendoim Torrado', IngredientCategory.EXTRA, 30, {
    basePrice: moneyFromReais(2),
    allergens: ['amendoim'],
    tags: ['vegan', 'sem-gluten'],
  }),
]

// ── Exported catalog ──────────────────────────────────────────────────────────

export const VIVERE_MENU: MenuConfig = {
  tenantId: 'vivere',
  version: '1.0.0',
  lastUpdated: '2026-05-09',
  ingredients: [
    ...PROTEINS,
    ...CARBS,
    ...LEGUMES,
    ...VEGETABLES,
    ...SALADS,
    ...SAUCES,
    ...EXTRAS,
  ],
}
