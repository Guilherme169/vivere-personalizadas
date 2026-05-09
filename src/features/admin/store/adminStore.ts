import { create } from 'zustand'
import type { CatalogData } from '@/application/ports'
import { services } from '@/infrastructure/ServiceFactory'

interface AdminState {
  data: CatalogData
  dirty: boolean
  reload: () => void
  update: (patch: Partial<CatalogData>) => void
  persist: () => void
}

function initialData(): CatalogData {
  return services.ingredientRepo.load()
}

export const useAdminStore = create<AdminState>((set, get) => ({
  data: initialData(),
  dirty: false,

  reload: () => set({ data: services.ingredientRepo.load(), dirty: false }),

  update: (patch) => set(s => ({ data: { ...s.data, ...patch }, dirty: true })),

  persist: () => {
    services.ingredientRepo.save(get().data)
    set({ dirty: false })
  },
}))
