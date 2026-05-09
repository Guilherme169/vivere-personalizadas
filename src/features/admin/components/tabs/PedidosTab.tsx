import { useState, useCallback } from 'react'
import { Download, Trash2 } from 'lucide-react'
import { services } from '@/infrastructure/ServiceFactory'
import type { Order } from '@/domain/order'
import { formatBRL } from '@/domain/pricing'
import { calculateOrderPricing } from '@/domain/pricing'
import { useAdminStore } from '../../store/adminStore'

function useOrders() {
  const [orders, setOrders] = useState<Order[]>(() => services.orderRepo.list())
  const reload = useCallback(() => setOrders(services.orderRepo.list()), [])
  return { orders, reload }
}

export function PedidosTab() {
  const { data } = useAdminStore()
  const { orders, reload } = useOrders()

  function handleExport() {
    const blob = new Blob([JSON.stringify(orders, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vivere-orders-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleClear() {
    if (!confirm('Apagar todos os pedidos do localStorage?')) return
    services.orderRepo.clear()
    reload()
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-texto-suave">{orders.length} pedido(s) registrado(s)</p>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={orders.length === 0}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-borda text-verde-escuro text-sm font-medium hover:bg-verde-escuro/5 transition-colors disabled:opacity-40"
          >
            <Download size={15} /> Exportar JSON
          </button>
          <button
            onClick={handleClear}
            disabled={orders.length === 0}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-40"
          >
            <Trash2 size={15} /> Limpar
          </button>
        </div>
      </div>

      {orders.length === 0 && (
        <p className="text-center text-texto-suave py-10 text-sm">Nenhum pedido registrado ainda.</p>
      )}

      <div className="space-y-3">
        {orders.map(order => {
          const pricing = calculateOrderPricing(
            order.cardapios,
            data.ingredients,
            data.pricingConfig,
            data.customerPricingRules,
            order.fulfillment,
          )
          const date = new Date(order.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

          return (
            <div key={order.id} className="bg-surface rounded-2xl border border-borda p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-[15px] text-verde-escuro">{order.customer.name || '—'}</p>
                  <p className="text-xs text-texto-suave">{order.customer.phone} · {date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-verde-escuro">{formatBRL(pricing.totalPedido)}</p>
                  <p className="text-xs text-texto-suave">{pricing.totalUnits} un · {order.fulfillment}</p>
                </div>
              </div>
              {pricing.descontoPct > 0 && (
                <p className="text-xs text-verde-vivo">Desconto {pricing.descontoPct * 100}% aplicado</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
