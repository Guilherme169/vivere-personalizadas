import type { MenuRepository } from '@/application/ports/MenuRepository'
import type { PricingRepository } from '@/application/ports/PricingRepository'
import { StaticMenuRepository } from './repositories/StaticMenuRepository'
import { StaticPricingRepository } from './repositories/StaticPricingRepository'

export interface AppServices {
  readonly menuRepository: MenuRepository
  readonly pricingRepository: PricingRepository
}

export const createVivereServices = (): AppServices => ({
  menuRepository: new StaticMenuRepository(),
  pricingRepository: new StaticPricingRepository(),
})
