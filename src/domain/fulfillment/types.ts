export interface FulfillmentZone {
  id: string
  citySlug: string
  cityName: string
  deliveryFeeBRL: number
  freeDeliveryAtTotalUnits: number | null
  deliveryDays: string[]
  deliveryPeriod: string | null
  minUnits: number
  requiresScheduling: boolean
  deliveryFeeNote: string | null
  notes: string | null
  active: boolean
}
