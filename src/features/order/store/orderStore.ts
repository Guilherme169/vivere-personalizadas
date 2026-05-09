import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import type { Customer, DraftMealEntry, OrderDraft } from '@/domain/order'
import {
  createOrderDraft,
  addMealToOrder,
  removeMealFromOrder,
  updateOrderCustomer,
  setOrderNotes,
} from '@/domain/order'
import type { WhatsAppMessage } from '@/application'
import { formatWhatsAppMessage } from '@/application'

export type OrderStep = 'building' | 'customer-info' | 'review' | 'submitted'

interface OrderState {
  draft: OrderDraft
  step: OrderStep
  whatsappMessage: WhatsAppMessage | null
  addMeal: (entry: DraftMealEntry, businessPhone: string) => void
  removeMeal: (mealId: string) => void
  updateCustomer: (customer: Customer) => void
  setNotes: (notes: string) => void
  setStep: (step: OrderStep) => void
  prepareWhatsApp: (businessPhone: string) => void
  reset: () => void
}

export const useOrderStore = create<OrderState>()(
  devtools(
    persist(
      (set, get) => ({
        draft: createOrderDraft(),
        step: 'building' as OrderStep,
        whatsappMessage: null,

        addMeal: (entry, businessPhone) => {
          const newDraft = addMealToOrder(get().draft, entry)
          set(
            { draft: newDraft, whatsappMessage: formatWhatsAppMessage(newDraft, businessPhone) },
            false,
            'order/addMeal',
          )
        },

        removeMeal: (mealId) =>
          set(
            (s) => ({ draft: removeMealFromOrder(s.draft, mealId) }),
            false,
            'order/removeMeal',
          ),

        updateCustomer: (customer) =>
          set(
            (s) => ({ draft: updateOrderCustomer(s.draft, customer) }),
            false,
            'order/updateCustomer',
          ),

        setNotes: (notes) =>
          set((s) => ({ draft: setOrderNotes(s.draft, notes) }), false, 'order/setNotes'),

        setStep: (step) => set({ step }, false, 'order/setStep'),

        prepareWhatsApp: (businessPhone) => {
          const { draft } = get()
          set({ whatsappMessage: formatWhatsAppMessage(draft, businessPhone) }, false, 'order/prepareWhatsApp')
        },

        reset: () =>
          set(
            { draft: createOrderDraft(), step: 'building', whatsappMessage: null },
            false,
            'order/reset',
          ),
      }),
      {
        name: 'vivere-order-draft',
        storage: createJSONStorage(() => localStorage, {
          // Restore Date objects that JSON serialization converts to strings.
          reviver: (key, value) =>
            key === 'createdAt' && typeof value === 'string' ? new Date(value) : value,
        }),
        partialize: (state) => ({ draft: state.draft, step: state.step }),
      },
    ),
    { name: 'OrderStore' },
  ),
)
