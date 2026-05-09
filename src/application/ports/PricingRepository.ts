import type { PricingConfig } from '@/domain/pricing'
import type { PricingRule } from '@/domain/pricing'

export interface PricingRepository {
  getPricingConfig(): Promise<PricingConfig>
  getActiveRules(): Promise<readonly PricingRule[]>
  // Future: getPricingConfigForTenant(tenantId: string): Promise<PricingConfig>
}
