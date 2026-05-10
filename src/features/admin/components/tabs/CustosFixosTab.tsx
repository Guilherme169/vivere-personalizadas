import { useAdminStore } from '../../store/adminStore'
import type { PricingConfig } from '@/domain/pricing'

type Field = 'packaging' | 'delivery' | 'other'

const FIELDS: { key: Field; label: string; hint: string }[] = [
  { key: 'packaging', label: 'Embalagem (R$)', hint: 'Custo por unidade' },
  { key: 'delivery', label: 'Entrega fixa (R$)', hint: 'Custo de delivery por unidade' },
  { key: 'other', label: 'Outros (R$)', hint: 'Outros custos variáveis por unidade' },
]

export function CustosFixosTab() {
  const { data, update, role } = useAdminStore()
  const config = data.pricingConfig
  const canWrite = role !== 'atendente'

  function set(key: Field, value: string) {
    const n = parseFloat(value)
    if (isNaN(n)) return
    update({ pricingConfig: { ...config, [key]: n } as PricingConfig })
  }

  return (
    <div className="space-y-5 pt-2">
      <p className="text-sm text-texto-suave">Custos por unidade somados ao custo de ingredientes antes do markup.</p>
      {FIELDS.map(f => (
        <div key={f.key} className="space-y-1.5">
          <label className="text-sm font-medium text-verde-escuro">{f.label}</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={config[f.key]}
            readOnly={!canWrite}
            onChange={e => canWrite && set(f.key, e.target.value)}
            className="w-full h-11 rounded-2xl bg-creme border border-borda px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-verde-escuro/30 read-only:opacity-60 read-only:cursor-not-allowed"
          />
          <p className="text-xs text-texto-suave">{f.hint}</p>
        </div>
      ))}
    </div>
  )
}
