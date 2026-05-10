export interface Customer {
  id?: string
  name: string
  phone: string
  address?: string       // current session address (not persisted in CRM)
  lastAddress?: string   // last known delivery address from Supabase
  source?: string
  consentLgpdAt?: string
  firstStartedAt?: string
  lastStartedAt?: string
  totalOrders?: number
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}
