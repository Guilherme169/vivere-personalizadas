import type { MenuRepository } from '@/application/ports/MenuRepository'
import type { PricingRepository } from '@/application/ports/PricingRepository'
import type { Ingredient } from '@/domain/meal'
import type { PricingContext, PricingRule } from '@/domain/pricing'
import { createPricingContext } from '@/domain/pricing'

// Everything a feature needs to operate — loaded once per session.
// Mobile note: the three async calls run in parallel (Promise.all) to minimize
// perceived load time on slow mobile connections.
export interface SessionBootstrap {
  readonly ingredients: readonly Ingredient[]
  readonly pricingContext: PricingContext
  readonly rules: readonly PricingRule[]
  readonly businessPhone: string
}

export const bootstrapSession = async (
  menuRepo: MenuRepository,
  pricingRepo: PricingRepository,
  /** Business WhatsApp number in E.164 without '+'. Provided by the app shell from tenant config. */
  businessPhone: string,
): Promise<SessionBootstrap> => {
  const [ingredients, config, rules] = await Promise.all([
    menuRepo.getIngredients(),
    pricingRepo.getPricingConfig(),
    pricingRepo.getActiveRules(),
  ])

  return {
    ingredients,
    pricingContext: createPricingContext(config),
    rules,
    businessPhone,
  }
}
