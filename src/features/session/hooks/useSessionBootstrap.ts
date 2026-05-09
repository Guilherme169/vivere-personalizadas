import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { bootstrapSession } from '@/application'
import { useAppServices } from '@/features/shared/hooks/useAppServices'
import { useSessionStore } from '../store/sessionStore'

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '555180889884'

export const useSessionBootstrap = () => {
  const { menuRepository, pricingRepository } = useAppServices()

  useEffect(() => {
    if (useSessionStore.getState().status !== 'idle') return

    useSessionStore.getState().setLoading()
    bootstrapSession(menuRepository, pricingRepository, WHATSAPP_NUMBER)
      .then((data) => useSessionStore.getState().setReady(data))
      .catch((e: unknown) =>
        useSessionStore.getState().setError(
          e instanceof Error ? e.message : 'Erro ao carregar sessão',
        ),
      )
  }, [menuRepository, pricingRepository])

  return useSessionStore(
    useShallow((s) => ({ status: s.status, data: s.data, error: s.error })),
  )
}
