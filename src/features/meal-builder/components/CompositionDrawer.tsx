import { useState } from 'react'
import { ArrowRight, ChevronDown, Trash2, Pencil } from 'lucide-react'
import { useWizardStore } from '../store/wizardStore'
import { calculateMealPrice, formatPrice99, formatBRL } from '@/domain/pricing'
import { totalWeight } from '@/domain/meal'
import { CATEGORY_LABEL } from '@/domain/catalog'

export function CompositionDrawer() {
  const [expanded, setExpanded] = useState(false)
  const { draftItems, catalog, pricingConfig, navigate, removeFromDraft, editDraftItem } = useWizardStore()

  if (draftItems.length === 0) return null

  const weight = totalWeight(draftItems)
  const { finalPrice } = calculateMealPrice(draftItems, catalog, pricingConfig)
  const weightOk = weight >= 200

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-borda shadow-lg">
      {!expanded ? (
        /* Collapsed: price info + orange CTA */
        <div className="px-5 pt-3 pb-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-medium uppercase tracking-wide text-texto-suave">Preço em tempo real</span>
            <span className={`text-xs ${weightOk ? 'text-texto-suave' : 'text-aviso'}`}>
              {weight}g{!weightOk ? ' · mín. 200g' : ''}
            </span>
          </div>
          <p className="font-display font-semibold text-2xl text-verde-escuro mb-3">
            {formatPrice99(finalPrice)}
          </p>
          <button
            onClick={() => setExpanded(true)}
            className="w-full h-12 rounded-2xl bg-laranja text-white font-medium text-[15px] shadow-cta hover:bg-laranja-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Ver e finalizar marmita
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </div>
      ) : (
        /* Expanded */
        <div className="max-h-[75vh] overflow-y-auto no-scrollbar">
          {/* Close bar */}
          <button
            onClick={() => setExpanded(false)}
            className="w-full flex items-center justify-between px-5 py-3 border-b border-borda"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display font-semibold text-[18px] text-verde-escuro">{formatPrice99(finalPrice)}</span>
              <span className="text-xs text-texto-suave">{weight}g</span>
            </div>
            <div className="flex items-center gap-1.5 text-texto-suave">
              <span className="text-xs font-medium">Fechar</span>
              <ChevronDown size={16} strokeWidth={1.75} />
            </div>
          </button>

          <div className="px-5 pb-4">
            {/* Weight alert */}
            {weight < 200 && (
              <p className="text-xs text-aviso bg-aviso/10 rounded-xl px-3 py-2 mt-3 mb-3">
                Peso abaixo de 200g — adicione mais ingredientes para uma marmita completa.
              </p>
            )}

            {/* Item list */}
            <ul className="space-y-2 mt-3 mb-3">
              {draftItems.map(item => {
                const ing = catalog.find(i => i.id === item.ingredientId)
                const prep = ing?.preparations.find(p => p.id === item.preparationId)
                if (!ing || !prep) return null
                return (
                  <li key={item.ingredientId} className="flex items-center gap-3 bg-creme rounded-2xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-verde-escuro truncate">{ing.name}</p>
                      <p className="text-xs text-texto-suave">
                        {CATEGORY_LABEL[ing.category]} · {prep.name}{item.grams > 0 ? ` · ${item.grams}g` : ''}
                      </p>
                    </div>
                    <button onClick={() => editDraftItem(ing.id)} className="p-1.5 rounded-lg hover:bg-verde-escuro/8 text-texto-suave">
                      <Pencil size={14} strokeWidth={1.75} />
                    </button>
                    <button onClick={() => removeFromDraft(ing.id)} className="p-1.5 rounded-lg hover:bg-erro/10 text-erro">
                      <Trash2 size={14} strokeWidth={1.75} />
                    </button>
                  </li>
                )
              })}
            </ul>

            {/* Subtotal */}
            <p className="text-xs text-texto-suave mb-3">
              {weight}g · {formatPrice99(finalPrice)} / un · total estimado {formatBRL(finalPrice)}
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-2" style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}>
              <button
                onClick={() => { setExpanded(false); navigate('category', 'back') }}
                className="h-11 rounded-xl bg-transparent border border-verde-escuro text-verde-escuro text-sm font-medium hover:bg-verde-escuro/5 active:scale-[0.98] transition-all"
              >
                + Adicionar mais ingrediente
              </button>
              <button
                onClick={() => { setExpanded(false); navigate('quantity', 'forward') }}
                className="h-12 rounded-2xl bg-laranja text-white font-medium text-[15px] shadow-cta hover:bg-laranja-hover active:scale-[0.98] transition-all"
              >
                Finalizar este cardápio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
