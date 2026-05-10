import { useAdminStore } from '../../store/adminStore'
import type { CustomerPricingRules } from '@/domain/pricing'

type Field = keyof CustomerPricingRules

const FIELDS: { key: Field; label: string; hint: string; step: number }[] = [
  { key: 'deliveryFeeBRL', label: 'Taxa de entrega (R$)', hint: 'Cobrada quando abaixo do mínimo para frete grátis', step: 0.5 },
  { key: 'freeDeliveryAtTotalUnits', label: 'Frete grátis a partir de (unidades)', hint: 'Total de marmitas do pedido', step: 1 },
  { key: 'discount5pctAtTotalUnits', label: 'Desconto 5% a partir de (unidades)', hint: '', step: 1 },
  { key: 'discount10pctAtTotalUnits', label: 'Desconto 10% a partir de (unidades)', hint: '', step: 1 },
]

export function RegrasClienteTab() {
  const { data, update, role } = useAdminStore()
  const rules = data.customerPricingRules
  const canWrite = role !== 'atendente'

  function set(key: Field, value: string) {
    const n = parseFloat(value)
    if (isNaN(n)) return
    update({ customerPricingRules: { ...rules, [key]: n } as CustomerPricingRules })
  }

  return (
    <div className="space-y-5 pt-2">
      <p className="text-sm text-texto-suave">Regras de desconto e frete exibidas ao cliente no resumo do pedido.</p>
      {FIELDS.map(f => (
        <div key={f.key} className="space-y-1.5">
          <label className="text-sm font-medium text-verde-escuro">{f.label}</label>
          <input
            type="number"
            min={0}
            step={f.step}
            value={rules[f.key]}
            readOnly={!canWrite}
            onChange={e => canWrite && set(f.key, e.target.value)}
            className="w-full h-11 rounded-2xl bg-creme border border-borda px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-verde-escuro/30 read-only:opacity-60 read-only:cursor-not-allowed"
          />
          {f.hint && <p className="text-xs text-texto-suave">{f.hint}</p>}
        </div>
      ))}
    </div>
  )
}
