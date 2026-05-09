import { moneyFromReais } from '@/domain/shared'
import { ContainerSize } from '@/domain/meal'
import type { PricingConfig } from '@/domain/pricing'

// Vivere base prices — one price covers the standard composition for each size:
// 1 protein (non-premium) + 1 carb + feijão (optional) + unlimited vegetables
export const VIVERE_PRICING_CONFIG: PricingConfig = {
  basePrices: {
    [ContainerSize.SMALL]: moneyFromReais(22),
    [ContainerSize.MEDIUM]: moneyFromReais(28),
    [ContainerSize.LARGE]: moneyFromReais(34),
    [ContainerSize.EXTRA_LARGE]: moneyFromReais(40),
  },
}
