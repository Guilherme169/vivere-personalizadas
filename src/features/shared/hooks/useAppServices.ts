import { createContext, useContext } from 'react'
import type { AppServices } from '@/infrastructure/ServiceFactory'

const AppServicesContext = createContext<AppServices | null>(null)

export const AppServicesProvider = AppServicesContext.Provider

export const useAppServices = (): AppServices => {
  const services = useContext(AppServicesContext)
  if (!services) throw new Error('useAppServices must be used within AppServicesProvider')
  return services
}
