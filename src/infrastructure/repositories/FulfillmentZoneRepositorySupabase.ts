import type { FulfillmentZone } from '@/domain/fulfillment'
import { supabase } from '../supabase/client'

function mapRow(row: Record<string, unknown>): FulfillmentZone {
  return {
    id: row.id as string,
    citySlug: row.city_slug as string,
    cityName: row.city_name as string,
    deliveryFeeBRL: (row.delivery_fee_brl as number) ?? 0,
    freeDeliveryAtTotalUnits: (row.free_delivery_at_total_units as number | null) ?? null,
    deliveryDays: (row.delivery_days as string[]) ?? [],
    deliveryPeriod: (row.delivery_period as string | null) ?? null,
    minUnits: (row.min_units as number) ?? 5,
    requiresScheduling: (row.requires_scheduling as boolean) ?? false,
    deliveryFeeNote: (row.delivery_fee_note as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    active: (row.active as boolean) ?? true,
  }
}

export const FulfillmentZoneRepositorySupabase = {
  async listActive(): Promise<FulfillmentZone[]> {
    const { data, error } = await supabase
      .from('fulfillment_zones')
      .select('*')
      .eq('active', true)
      .order('city_name')
    if (error) throw error
    return (data ?? []).map(row => mapRow(row as Record<string, unknown>))
  },

  async update(id: string, patch: Partial<FulfillmentZone>): Promise<void> {
    const dbPatch: Record<string, unknown> = {}
    if (patch.cityName !== undefined) dbPatch.city_name = patch.cityName
    if (patch.deliveryFeeBRL !== undefined) dbPatch.delivery_fee_brl = patch.deliveryFeeBRL
    if (patch.minUnits !== undefined) dbPatch.min_units = patch.minUnits
    if (patch.deliveryDays !== undefined) dbPatch.delivery_days = patch.deliveryDays
    if (patch.deliveryPeriod !== undefined) dbPatch.delivery_period = patch.deliveryPeriod
    if (patch.requiresScheduling !== undefined) dbPatch.requires_scheduling = patch.requiresScheduling
    if (patch.deliveryFeeNote !== undefined) dbPatch.delivery_fee_note = patch.deliveryFeeNote
    if (patch.notes !== undefined) dbPatch.notes = patch.notes
    if (patch.active !== undefined) dbPatch.active = patch.active

    const { error } = await supabase.from('fulfillment_zones').update(dbPatch).eq('id', id)
    if (error) throw error
  },
}
