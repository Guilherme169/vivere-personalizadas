import { useState } from 'react'
import { ChevronUp, ChevronDown, Trash2, Pencil } from 'lucide-react'
import { useWizardStore } from '../store/wizardStore'
import { calculateMealPrice, formatPrice99 } from '@/domain/pricing'
import { totalWeight, suggestContainer, computeDietBadges, DIET_FLAG_LABEL, CONTAINER_LABEL } from '@/domain/meal'
import { CATEGORY_LABEL } from '@/domain/catalog'

export function CompositionDrawer() {
  const [expanded, setExpanded] = useState(false)
  const { draftItems, catalog, pricingConfig, navigate, removeFromDraft, editDraftItem } = useWizardStore()

  if (draftItems.length === 0) return null

  const weight = totalWeight(draftItems)
  const container = suggestContainer(weight)
  const { finalPrice } = calculateMealPrice(draftItems, catalog, pricingConfig)
  const badges = computeDietBadges(draftItems, catalog)

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-borda shadow-lg transition-all">
      {/* Drag handle + summary row */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3"
      >
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium text-verde-escuro">{weight}g</span>
          <span className="text-borda">·</span>
          <span className="text-texto-suave">{CONTAINER_LABEL[container]}</span>
          <span className="text-borda">·</span>
          <span className="font-semibold text-laranja font-display">{formatPrice99(finalPrice)}</span>
        </div>
        <div className="flex items-center gap-2 text-texto-suave">
          <span className="text-xs">{expanded ? 'Fechar' : 'Ver composição'}</span>
          {expanded ? <ChevronDown size={16} strokeWidth={1.75} /> : <ChevronUp size={16} strokeWidth={1.75} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-4 max-h-[60vh] overflow-y-auto no-scrollbar">
          {/* Weight alert */}
          {weight < 200 && (
            <p className="text-xs text-aviso bg-aviso/10 rounded-xl px-3 py-2 mb-3">
              Peso abaixo de 200g — adicione mais ingredientes para uma marmita completa.
            </p>
          )}

          {/* Item list */}
          <ul className="space-y-2 mb-3">
            {draftItems.map(item => {
              const ing = catalog.find(i => i.id === item.ingredientId)
              const prep = ing?.preparations.find(p => p.id === item.preparationId)
              if (!ing || !prep) return null
              return (
                <li key={item.ingredientId} className="flex items-center gap-3 bg-creme rounded-2xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-verde-escuro truncate">{ing.name}</p>
                    <p className="text-xs text-texto-suave">{CATEGORY_LABEL[ing.category]} · {prep.name} · {item.grams}g</p>
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

          {/* Diet badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {badges.map(flag => (
                <span key={flag} className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-verde-vivo/12 text-verde-escuro text-xs font-medium">
                  ✓ {DIET_FLAG_LABEL[flag]}
                </span>
              ))}
            </div>
          )}

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
      )}
    </div>
  )
}
