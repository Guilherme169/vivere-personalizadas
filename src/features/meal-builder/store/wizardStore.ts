import { create } from 'zustand'
import type { Ingredient, Category } from '@/domain/catalog'
import type { CompositionItem, Cardapio } from '@/domain/cardapio'
import type { Customer, Fulfillment } from '@/domain/order'
import type { PricingConfig, CompositionRules, CustomerPricingRules } from '@/domain/pricing'
import { services } from '@/infrastructure/ServiceFactory'

export type WizardStep =
  | 'hero'
  | 'category'
  | 'ingredient'
  | 'preparation'
  | 'gramatura'
  | 'quantity'
  | 'add-more'
  | 'summary'
  | 'confirmation'

interface WizardState {
  step: WizardStep
  direction: 'forward' | 'back'

  catalog: Ingredient[]
  pricingConfig: PricingConfig
  compositionRules: CompositionRules
  customerPricingRules: CustomerPricingRules

  draftItems: CompositionItem[]
  selectedCategory: Category | null
  selectedIngredientId: string | null
  selectedPreparationId: string | null

  cardapios: Cardapio[]

  customer: Customer
  fulfillment: Fulfillment
  notes: string

  navigate: (step: WizardStep, direction?: 'forward' | 'back') => void
  loadCatalog: () => void
  selectCategory: (cat: Category) => void
  selectIngredient: (id: string) => void
  selectPreparation: (id: string) => void
  addItemToDraft: (grams: number) => void
  removeFromDraft: (ingredientId: string) => void
  editDraftItem: (ingredientId: string) => void
  finalizeCardapio: (quantity: number) => void
  resetDraft: () => void
  updateCustomer: (data: Partial<Customer>) => void
  setFulfillment: (f: Fulfillment) => void
  setNotes: (n: string) => void
  startNewCardapio: () => void
}

export const useWizardStore = create<WizardState>((set, get) => ({
  step: 'hero',
  direction: 'forward',

  catalog: [],
  pricingConfig: {
    packaging: 1.61, delivery: 1.5, other: 1, monthlyRent: 1500,
    monthlyVolume: 1200, cooksPerShift: 2, cookSalaryPerMonth: 2000, markupPercentage: 60,
  },
  compositionRules: {
    minWeightPerMealG: 200, maxWeightPerMealG: 600,
    maxItemsByCategory: { protein: 1, carb: 2, vegetable: 3, seasoning: 1, dairy: 1, other: 2 },
    minMealsPerCardapio: 5,
  },
  customerPricingRules: {
    deliveryFeeBRL: 6, freeDeliveryAtTotalUnits: 6,
    discount5pctAtTotalUnits: 11, discount10pctAtTotalUnits: 16,
  },

  draftItems: [],
  selectedCategory: null,
  selectedIngredientId: null,
  selectedPreparationId: null,

  cardapios: [],

  customer: { name: '', phone: '', address: '' },
  fulfillment: 'entrega',
  notes: '',

  navigate: (step, direction = 'forward') => set({ step, direction }),

  loadCatalog: () => {
    const data = services.ingredientRepo.load()
    set({
      catalog: data.ingredients,
      pricingConfig: data.pricingConfig,
      compositionRules: data.compositionRules,
      customerPricingRules: data.customerPricingRules,
    })
  },

  selectCategory: (cat) => set({ selectedCategory: cat, direction: 'forward', step: 'ingredient' }),

  selectIngredient: (id) => {
    const { catalog } = get()
    const ing = catalog.find(i => i.id === id)
    if (!ing) return
    set({ selectedIngredientId: id, selectedPreparationId: null })
    if (ing.preparations.length > 1) {
      set({ direction: 'forward', step: 'preparation' })
    } else {
      set({ selectedPreparationId: ing.preparations[0]?.id ?? null, direction: 'forward', step: 'gramatura' })
    }
  },

  selectPreparation: (id) => set({ selectedPreparationId: id, direction: 'forward', step: 'gramatura' }),

  addItemToDraft: (grams) => {
    const { selectedIngredientId, selectedPreparationId, draftItems } = get()
    if (!selectedIngredientId || !selectedPreparationId) return
    const newItem: CompositionItem = { ingredientId: selectedIngredientId, preparationId: selectedPreparationId, grams }
    set({
      draftItems: [...draftItems, newItem],
      selectedIngredientId: null,
      selectedPreparationId: null,
      direction: 'back',
      step: 'category',
    })
  },

  removeFromDraft: (ingredientId) =>
    set(s => ({ draftItems: s.draftItems.filter(i => i.ingredientId !== ingredientId) })),

  editDraftItem: (ingredientId) => {
    const { catalog } = get()
    const ing = catalog.find(i => i.id === ingredientId)
    if (!ing) return
    set(s => ({
      draftItems: s.draftItems.filter(i => i.ingredientId !== ingredientId),
      selectedIngredientId: ingredientId,
      selectedPreparationId: null,
      selectedCategory: ing.category,
      direction: 'forward',
      step: ing.preparations.length > 1 ? 'preparation' : 'gramatura',
    }))
  },

  finalizeCardapio: (quantity) => {
    const { draftItems, cardapios } = get()
    const newCardapio: Cardapio = {
      id: `cardapio-${Date.now()}`,
      items: [...draftItems],
      quantity,
    }
    set({ cardapios: [...cardapios, newCardapio], direction: 'forward', step: 'add-more' })
  },

  resetDraft: () => set({ draftItems: [], selectedCategory: null, selectedIngredientId: null, selectedPreparationId: null }),

  startNewCardapio: () => {
    get().resetDraft()
    set({ direction: 'forward', step: 'category' })
  },

  updateCustomer: (data) => set(s => ({ customer: { ...s.customer, ...data } })),
  setFulfillment: (f) => set({ fulfillment: f }),
  setNotes: (n) => set({ notes: n }),
}))
