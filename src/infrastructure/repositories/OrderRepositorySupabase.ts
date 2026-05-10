import type { Order } from '@/domain/order'
import type { OrderRepository } from '@/application/ports'
import { normalizePhone } from '@/domain/customer'
import { supabase } from '../supabase/client'

export const OrderRepositorySupabase: OrderRepository = {
  async persist(order: Order): Promise<void> {
    const phone = normalizePhone(order.customer.phone)

    // Use customer.id from lead-capture if available; otherwise upsert for safety
    let customerId = order.customer.id
    if (!customerId) {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .upsert(
          { phone, name: order.customer.name, last_address: order.customer.address ?? null },
          { onConflict: 'phone' }
        )
        .select('id')
        .single()
      if (customerError) throw customerError
      customerId = customerData.id as string
    }

    const totalUnits = order.cardapios.reduce((sum, c) => sum + c.quantity, 0)

    const { error: orderError } = await supabase.from('orders').insert({
      id: order.id,
      customer_id: customerId,
      customer_name: order.customer.name,
      customer_phone: phone,
      customer_address: order.customer.address ?? null,
      fulfillment: order.fulfillment,
      city_slug: order.citySlug ?? null,
      payload: order,
      notes: order.notes ?? null,
      total_units: totalUnits,
      total_brl: 0,
      payment_method: order.paymentMethod ?? null,
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

  async findLastByCustomerPhone(phone: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, payload')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return {
      ...(data.payload as Order),
      id: data.id as string,
      createdAt: data.created_at as string,
    }
  },
}
