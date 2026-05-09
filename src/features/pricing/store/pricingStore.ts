import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { PricingResult } from '@/domain/pricing'

interface PricingState {
  result: PricingResult | null
  setResult: (result: PricingResult) => void
  clearResult: () => void
}

export const usePricingStore = create<PricingState>()(
  devtools(
    (set) => ({
      result: null,
      setResult: (result) => set({ result }, false, 'pricing/setResult'),
      clearResult: () => set({ result: null }, false, 'pricing/clearResult'),
    }),
    { name: 'PricingStore' },
  ),
)
