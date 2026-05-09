import type { Order } from '@/domain/order'
import type { OrderRepository } from '@/application/ports'
import { supabase } from '../supabase/client'

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

export const OrderRepositorySupabase: OrderRepository = {
  async persist(order: Order): Promise<void> {
    const phone = normalizePhone(order.customer.phone)

    // Upsert customer by phone
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .upsert(
        {
          phone,
          name: order.customer.name,
          last_address: order.customer.address ?? null,
        },
        { onConflict: 'phone' }
      )
      .select('id')
      .single()

    if (customerError) throw customerError

    const totalUnits = order.cardapios.reduce((sum, c) => sum + c.quantity, 0)

    const { error: orderError } = await supabase.from('orders').insert({
      id: order.id,
      customer_id: customerData.id,
      customer_name: order.customer.name,
      customer_phone: phone,
      customer_address: order.customer.address ?? null,
      fulfillment: order.fulfillment,
      payload: order,
      notes: order.notes ?? null,
      total_units: totalUnits,
      total_brl: 0,
      status: 'novo',
      whatsapp_sent_at: new Date().toISOString(),
    })

    if (orderError) throw orderError
  },

  async list(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, payload')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data ?? []).map(row => ({
      ...(row.payload as Order),
      id: row.id,
      createdAt: row.created_at,
    }))
  },

  async clear(): Promise<void> {
    // No-op: orders in Supabase are managed via the dashboard.
  },
}
