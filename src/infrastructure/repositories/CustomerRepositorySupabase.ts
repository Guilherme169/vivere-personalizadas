import type { Customer } from '@/domain/customer'
import { normalizePhone } from '@/domain/customer'
import { supabase } from '../supabase/client'

function mapRow(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    lastAddress: (row.last_address as string | null) ?? undefined,
    source: (row.source as string | null) ?? undefined,
    consentLgpdAt: (row.consent_lgpd_at as string | null) ?? undefined,
    firstStartedAt: (row.first_started_at as string | null) ?? undefined,
    lastStartedAt: (row.last_started_at as string | null) ?? undefined,
  }
}

export const CustomerRepositorySupabase = {
  async findByPhone(phone: string): Promise<Customer | null> {
    const normalized = normalizePhone(phone)
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', normalized)
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data as Record<string, unknown>) : null
  },

  async upsertByPhone(customer: Customer): Promise<Customer> {
    const phone = normalizePhone(customer.phone)
    const existing = await this.findByPhone(phone)
    const now = new Date().toISOString()

    if (existing) {
      const { data, error } = await supabase
        .from('customers')
        .update({ name: customer.name, last_started_at: now })
        .eq('phone', phone)
        .select()
        .single()
      if (error) throw error
      return mapRow(data as Record<string, unknown>)
    } else {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          phone,
          name: customer.name,
          source: customer.source ?? 'web',
          first_started_at: now,
          last_started_at: now,
          consent_lgpd_at: customer.consentLgpdAt ?? now,
        })
        .select()
        .single()
      if (error) throw error
      return mapRow(data as Record<string, unknown>)
    }
  },
}
