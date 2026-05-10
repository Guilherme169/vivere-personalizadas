import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { AppHeader } from '@/features/shared/components/AppHeader'
import { useWizardStore } from '../store/wizardStore'
import { calculateMealPrice, calculateOrderPricing, formatPrice99, formatBRL } from '@/domain/pricing'
import { totalWeight, suggestContainer, CONTAINER_LABEL } from '@/domain/meal'
import type { Cardapio } from '@/domain/cardapio'

const QUICK_QTY = [5, 10, 15, 20]

export function QuantityStep() {
  const [custom, setCustom] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const {
    navigate, draftItems, catalog, pricingConfig, compositionRules,
    customerPricingRules, fulfillment, finalizeCardapio, cardapios,
  } = useWizardStore()
  const { finalPrice } = calculateMealPrice(draftItems, catalog, pricingConfig)
  const weight = totalWeight(draftItems)
  const container = suggestContainer(weight)
  const min = compositionRules.minMealsPerCardapio

  const weightWarning = weight < compositionRules.minWeightPerMealG

  function getQtyPricing(qty: number) {
    const preview: Cardapio[] = [{ id: 'preview', items: draftItems, quantity: qty }]
    return calculateOrderPricing(preview, catalog, pricingConfig, customerPricingRules, fulfillment)
  }

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

      <div className="px-5 pb-36 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {QUICK_QTY.map(q => {
            const p = getQtyPricing(q)
            const hasDiscount = p.descontoPct > 0
            const subtotalSemDesconto = finalPrice * q
            const freteGratis = p.frete === 0

            return (
              <button
                key={q}
                onClick={() => handleSelect(q)}
                className="rounded-3xl border border-borda bg-surface shadow-sm flex flex-col items-start justify-center gap-0.5 px-4 py-4 active:scale-[0.98] transition-transform hover:border-verde-escuro text-left"
              >
                <span className="font-display font-semibold text-[22px] text-verde-escuro">{q}</span>
                <span className="text-xs text-texto-suave">{q} unidades</span>

                {hasDiscount ? (
                  <>
                    <span className="text-sm font-semibold text-verde-vivo mt-1">
                      {formatBRL(p.totalPedido)} ({(p.descontoPct * 100).toFixed(0)}% off)
                    </span>
                    <span className="text-xs text-texto-suave line-through">
                      {formatBRL(subtotalSemDesconto)}
                    </span>
                    <span className="text-xs text-verde-escuro">
                      Você economiza {formatBRL(subtotalSemDesconto - p.totalPedido + p.frete)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-verde-escuro mt-1">
                      {formatBRL(p.totalPedido)}
                    </span>
                    {freteGratis ? (
                      <span className="text-xs text-verde-vivo">🚚 Frete grátis</span>
                    ) : (
                      <span className="text-xs text-texto-suave">Frete: {formatBRL(p.frete)}</span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>

        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="w-full h-12 rounded-2xl border-2 border-dashed border-verde-escuro/40 bg-transparent text-verde-escuro text-sm font-medium flex items-center justify-center gap-2 hover:bg-verde-escuro/5 active:scale-[0.98] transition-all"
          >
            <Pencil size={14} strokeWidth={1.75} />
            + Outra quantidade
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
