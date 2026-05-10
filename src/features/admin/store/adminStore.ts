import { create } from 'zustand'
import type { CatalogData } from '@/application/ports'
import { services } from '@/infrastructure/ServiceFactory'
import type { AdminRole } from '@/features/admin/types'

const defaultData: CatalogData = {
  ingredients: [],
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
}

interface AdminState {
  data: CatalogData
  loading: boolean
  dirty: boolean
  role: AdminRole | null
  setRole: (role: AdminRole | null) => void
  reload: () => Promise<void>
  update: (patch: Partial<CatalogData>) => void
  persist: () => Promise<void>
}

export const useAdminStore = create<AdminState>((set, get) => ({
  data: defaultData,
  loading: false,
  dirty: false,
  role: null,
  setRole: (role) => set({ role }),

  reload: async () => {
    set({ loading: true })
    try {
      const data = await services.ingredientRepo.load()
      set({ data, loading: false, dirty: false })
    } catch (err) {
      console.error('Failed to load catalog:', err)
      set({ loading: false })
    }
  },

  update: (patch) => set(s => ({ data: { ...s.data, ...patch }, dirty: true })),

  persist: async () => {
    try {
      await services.ingredientRepo.save(get().data)
      set({ dirty: false })
    } catch (err) {
      console.error('Failed to save catalog:', err)
      throw err
    }
  },
}))
