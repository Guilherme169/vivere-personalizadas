import { Plus, ArrowRight } from 'lucide-react'
import { AppHeader } from '@/features/shared/components/AppHeader'
import { useWizardStore } from '../store/wizardStore'
import { calculateMealPrice, calculateOrderPricing, formatPrice99, formatBRL } from '@/domain/pricing'
import { totalWeight, suggestContainer, CONTAINER_LABEL } from '@/domain/meal'
import { CATEGORY_LABEL } from '@/domain/catalog'

export function AddMoreStep() {
  const { navigate, cardapios, catalog, pricingConfig, customerPricingRules, fulfillment, startNewCardapio, resetDraft } = useWizardStore()

  const totalUnits = cardapios.reduce((s, c) => s + c.quantity, 0)
  const pricing = calculateOrderPricing(cardapios, catalog, pricingConfig, customerPricingRules, fulfillment)

  function handleAddMore() {
    resetDraft()
    startNewCardapio()
  }

  return (
    <div className="min-h-dvh bg-creme flex flex-col">
      <AppHeader showLogo />

      <div className="px-5 pt-2 pb-6">
        <h2 className="font-display font-semibold text-[28px] leading-[1.2] text-verde-escuro">
          Cardápio adicionado!
        </h2>
        <p className="text-sm text-texto-suave mt-1">
          Quer adicionar outro cardápio diferente ao mesmo pedido?
        </p>
      </div>

      {/* Pedido atual */}
      <div className="mx-5 bg-surface rounded-3xl shadow-md border border-borda overflow-hidden mb-5">
        {cardapios.map((c, i) => {
          const { finalPrice } = calculateMealPrice(c.items, catalog, pricingConfig)
          const weight = totalWeight(c.items)
          return (
            <div key={c.id} className={i > 0 ? 'border-t border-borda' : ''}>
              <div className="px-5 py-4">
                <p className="text-sm font-medium text-verde-escuro">Cardápio {i + 1} — {c.quantity} un.</p>
                <p className="text-xs text-texto-suave mt-0.5">
                  {weight}g · {CONTAINER_LABEL[suggestContainer(weight)]} · {formatPrice99(finalPrice)}/un
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.items.map(item => {
                    const ing = catalog.find(x => x.id === item.ingredientId)
                    return ing ? (
                      <span key={item.ingredientId} className="text-xs bg-creme border border-borda text-verde-escuro rounded-full px-2 py-0.5">
                        {CATEGORY_LABEL[ing.category]}: {ing.name} {item.grams}g
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            </div>
          )
        })}

        <div className="border-t border-borda px-5 py-4 bg-creme">
          <div className="flex justify-between text-sm">
            <span className="text-texto-suave">{totalUnits} unidades</span>
            <span className="font-semibold text-verde-escuro">{formatBRL(pricing.subtotalMarmitas)}</span>
          </div>
          {pricing.frete === 0 && (
            <p className="text-xs text-verde-vivo mt-1">✓ Frete grátis incluído</p>
          )}
          {pricing.descontoPct > 0 && (
            <p className="text-xs text-verde-vivo mt-0.5">
              ✓ Desconto de {(pricing.descontoPct * 100).toFixed(0)}% aplicado
            </p>
          )}
        </div>
      </div>

      <div className="px-5 flex flex-col gap-3">
        <button
          onClick={handleAddMore}
          className="w-full h-12 rounded-2xl border border-verde-escuro text-verde-escuro font-medium text-[15px] flex items-center justify-center gap-2 hover:bg-verde-escuro/5 active:scale-[0.98] transition-all"
        >
          <Plus size={18} strokeWidth={1.75} />
          Sim, adicionar outro cardápio
        </button>
        <button
          onClick={() => navigate('summary', 'forward')}
          className="w-full h-12 rounded-2xl bg-laranja text-white font-medium text-[15px] shadow-cta hover:bg-laranja-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Não, ir para o resumo
          <ArrowRight size={18} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
