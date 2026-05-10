import { create } from 'zustand'
import type { Ingredient, Category } from '@/domain/catalog'
import type { CompositionItem, Cardapio } from '@/domain/cardapio'
import type { Customer } from '@/domain/customer'
import type { Fulfillment, Order } from '@/domain/order'
import type { FulfillmentZone } from '@/domain/fulfillment'
import type { PricingConfig, CompositionRules, CustomerPricingRules } from '@/domain/pricing'
import { services } from '@/infrastructure/ServiceFactory'

export type WizardStep =
  | 'lead-capture'
  | 'welcome'
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

  customer: Customer | null
  lastOrder: Order | null
  fulfillment: Fulfillment
  selectedCitySlug: string | null
  fulfillmentZones: FulfillmentZone[]
  notes: string
  paymentMethod: 'pix' | 'cartao' | 'dinheiro' | null

  navigate: (step: WizardStep, direction?: 'forward' | 'back') => void
  loadCatalog: () => Promise<void>
  loadFulfillmentZones: () => Promise<void>
  setCustomer: (customer: Customer) => void
  setLastOrder: (order: Order | null) => void
  updateCustomer: (data: Partial<Customer>) => void
  selectCategory: (cat: Category) => void
  selectIngredient: (id: string) => void
  selectPreparation: (id: string) => void
  addItemToDraft: (grams: number) => void
  addDirectItem: (item: CompositionItem) => void
  removeFromDraft: (ingredientId: string) => void
  editDraftItem: (ingredientId: string) => void
  finalizeCardapio: (quantity: number) => void
  resetDraft: () => void
  setFulfillment: (f: Fulfillment) => void
  setSelectedCity: (slug: string) => void
  setNotes: (n: string) => void
  setPaymentMethod: (m: 'pix' | 'cartao' | 'dinheiro') => void
  startNewCardapio: () => void
}

export const useWizardStore = create<WizardState>((set, get) => ({
  step: 'lead-capture',
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

  customer: null,
  lastOrder: null,
  fulfillment: 'entrega',
  selectedCitySlug: null,
  fulfillmentZones: [],
  notes: '',
  paymentMethod: null,

  navigate: (step, direction = 'forward') => set({ step, direction }),

  loadCatalog: async () => {
    const data = await services.ingredientRepo.load()
    set({
      catalog: data.ingredients,
      pricingConfig: data.pricingConfig,
      compositionRules: data.compositionRules,
      customerPricingRules: data.customerPricingRules,
    })
  },

  loadFulfillmentZones: async () => {
    try {
      const zones = await services.zoneRepo.listActive()
      set(s => ({
        fulfillmentZones: zones,
        selectedCitySlug: s.selectedCitySlug ?? zones[0]?.citySlug ?? null,
      }))
    } catch (err) {
      console.error('Failed to load fulfillment zones:', err)
    }
  },

  setCustomer: (customer) => set({ customer }),
  setLastOrder: (order) => set({ lastOrder: order }),

  updateCustomer: (data) => set(s => ({
    customer: s.customer
      ? { ...s.customer, ...data }
      : { name: '', phone: '', ...data },
  })),

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

  addDirectItem: (item) => {
    set(s => ({
      draftItems: [...s.draftItems, item],
      direction: 'back',
      step: 'category',
    }))
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
      id: crypto.randomUUID(),
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

  setFulfillment: (f) => set({ fulfillment: f }),
  setSelectedCity: (slug) => set({ selectedCitySlug: slug }),
  setNotes: (n) => set({ notes: n }),
  setPaymentMethod: (m) => set({ paymentMethod: m }),
}))
