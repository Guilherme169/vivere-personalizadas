import { useAdminStore } from '../../store/adminStore'
import type { PricingConfig } from '@/domain/pricing'
import { formatBRL } from '@/domain/pricing'

type Field = 'monthlyRent' | 'monthlyVolume' | 'cooksPerShift' | 'cookSalaryPerMonth' | 'markupPercentage'

const FIELDS: { key: Field; label: string; min: number; step: number }[] = [
  { key: 'monthlyRent', label: 'Aluguel mensal (R$)', min: 0, step: 50 },
  { key: 'monthlyVolume', label: 'Volume mensal (marmitas)', min: 1, step: 10 },
  { key: 'cooksPerShift', label: 'Cozinheiros por turno', min: 1, step: 1 },
  { key: 'cookSalaryPerMonth', label: 'Salário por cozinheiro/mês (R$)', min: 0, step: 100 },
  { key: 'markupPercentage', label: 'Markup (%)', min: 1, step: 5 },
]

export function OperacionalTab() {
  const { data, update } = useAdminStore()
  const config = data.pricingConfig

  function set(key: Field, value: string) {
    const n = parseFloat(value)
    if (isNaN(n)) return
    update({ pricingConfig: { ...config, [key]: n } as PricingConfig })
  }

  const rentPerUnit = config.monthlyRent / config.monthlyVolume
  const cookCostPerUnit = (config.cooksPerShift * config.cookSalaryPerMonth) / config.monthlyVolume
  const totalFixed = config.packaging + config.delivery + rentPerUnit + cookCostPerUnit + config.other

  return (
    <div className="space-y-5 pt-2">
      {FIELDS.map(f => (
        <div key={f.key} className="space-y-1.5">
          <label className="text-sm font-medium text-verde-escuro">{f.label}</label>
          <input
            type="number"
            min={f.min}
            step={f.step}
            value={config[f.key]}
            onChange={e => set(f.key, e.target.value)}
            className="w-full h-11 rounded-2xl bg-creme border border-borda px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
          />
        </div>
      ))}

      <div className="rounded-2xl bg-verde-escuro/6 border border-verde-escuro/15 p-4 space-y-2">
        <p className="text-xs font-semibold text-verde-escuro uppercase tracking-wide mb-1">Custos fixos derivados / unidade</p>
        <div className="flex justify-between text-sm">
          <span className="text-texto-suave">Aluguel / unidade</span>
          <span className="text-verde-escuro font-medium">{formatBRL(rentPerUnit)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-texto-suave">Mão de obra / unidade</span>
          <span className="text-verde-escuro font-medium">{formatBRL(cookCostPerUnit)}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-verde-escuro/15 pt-2 mt-1">
          <span className="text-texto-suave font-medium">Total fixo / unidade</span>
          <span className="text-verde-escuro font-semibold">{formatBRL(totalFixed)}</span>
        </div>
      </div>
    </div>
  )
}
