import { useState } from 'react'
import { AppHeader } from '@/features/shared/components/AppHeader'
import { useWizardStore } from '../store/wizardStore'
import { calculateMealPrice, formatPrice99, formatBRL } from '@/domain/pricing'
import { totalWeight, suggestContainer, CONTAINER_LABEL } from '@/domain/meal'

const QUICK_QTY = [5, 10, 15, 20]

export function QuantityStep() {
  const [custom, setCustom] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const { navigate, draftItems, catalog, pricingConfig, compositionRules, finalizeCardapio, cardapios } = useWizardStore()
  const { finalPrice } = calculateMealPrice(draftItems, catalog, pricingConfig)
  const weight = totalWeight(draftItems)
  const container = suggestContainer(weight)
  const min = compositionRules.minMealsPerCardapio

  const weightWarning = weight < compositionRules.minWeightPerMealG

  function handleSelect(qty: number) {
    if (qty < min) return
    finalizeCardapio(qty)
  }

  function handleCustomSubmit() {
    const q = parseInt(custom, 10)
    if (isNaN(q) || q < min) return
    handleSelect(q)
  }

  return (
    <div className="min-h-dvh bg-creme flex flex-col">
      <AppHeader onBack={() => navigate('category', 'back')} />

      <div className="px-5 pt-2 pb-4">
        <h2 className="font-display font-semibold text-[28px] leading-[1.2] text-verde-escuro">
          Quantas unidades?
        </h2>
        <p className="text-sm text-texto-suave mt-1">Mínimo {min} unidades por cardápio</p>
      </div>

      {/* Marmita summary card */}
      <div className="mx-5 bg-surface rounded-3xl p-5 shadow-md border border-borda mb-4">
        {weightWarning && (
          <p className="text-xs text-aviso bg-aviso/10 rounded-xl px-3 py-2 mb-3">
            Peso total ({weight}g) abaixo de 200g. Considere adicionar mais ingredientes.
          </p>
        )}
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-texto-suave">{weight}g · {CONTAINER_LABEL[container]}</span>
        </div>
        <div className="text-3xl font-display font-semibold text-verde-escuro tabular-nums">
          {formatPrice99(finalPrice)}
          <span className="text-base font-sans font-normal text-texto-suave ml-2">/ unidade</span>
        </div>
        <p className="text-xs text-texto-suave mt-1">
          Cardápio {cardapios.length + 1} — {draftItems.length} ingrediente(s)
        </p>
      </div>

      <div className="px-5 pb-36 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {QUICK_QTY.map(q => (
            <button
              key={q}
              onClick={() => handleSelect(q)}
              className="h-20 rounded-3xl border border-borda bg-surface shadow-sm flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform hover:border-verde-escuro"
            >
              <span className="font-display font-semibold text-[28px] text-verde-escuro">{q}</span>
              <span className="text-xs text-texto-suave">{formatBRL(finalPrice * q)}</span>
            </button>
          ))}
        </div>

        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="w-full h-11 rounded-xl border border-borda bg-transparent text-verde-escuro text-sm font-medium hover:bg-verde-escuro/5 active:scale-[0.98] transition-all"
          >
            Outro (digitar quantidade)
          </button>
        ) : (
          <div>
            <label className="text-xs font-medium text-texto-suave uppercase tracking-wide block mb-1.5">
              Quantidade personalizada (mín. {min})
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={min}
                step={1}
                placeholder={`${min}`}
                value={custom}
                onChange={e => setCustom(e.target.value)}
                className="flex-1 h-12 rounded-2xl bg-surface border border-borda px-4 text-[15px] placeholder:text-texto-suave focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
              />
              <button
                onClick={handleCustomSubmit}
                className="h-12 px-5 rounded-2xl bg-laranja text-white font-medium shadow-cta hover:bg-laranja-hover active:scale-[0.98] transition-all"
              >
                Ok
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
