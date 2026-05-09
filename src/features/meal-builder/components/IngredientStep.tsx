import { useState } from 'react'
import { Search } from 'lucide-react'
import { AppHeader } from '@/features/shared/components/AppHeader'
import { useWizardStore } from '../store/wizardStore'
import { CompositionDrawer } from './CompositionDrawer'
import { canAddItem } from '@/domain/meal'
import { DIET_FLAG_LABEL } from '@/domain/meal'
import { calculateItemCost, formatPrice99 } from '@/domain/pricing'
import type { DietFlag } from '@/domain/catalog'

export function IngredientStep() {
  const [query, setQuery] = useState('')
  const {
    navigate, selectedCategory, catalog, draftItems,
    compositionRules, selectIngredient,
  } = useWizardStore()

  const ingredients = catalog.filter(i => i.category === selectedCategory)
  const filtered = query.trim()
    ? ingredients.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
    : ingredients

  return (
    <div className="min-h-dvh bg-creme flex flex-col">
      <AppHeader onBack={() => navigate('category', 'back')} />

      <div className="px-5 pt-2 pb-3">
        <h2 className="font-display font-semibold text-[28px] leading-[1.2] text-verde-escuro">
          Escolha o ingrediente
        </h2>

        {ingredients.length > 8 && (
          <div className="relative mt-3">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-texto-suave" strokeWidth={1.75} />
            <input
              type="search"
              placeholder="Buscar..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-11 rounded-2xl bg-surface border border-borda pl-10 pr-4 text-[15px] placeholder:text-texto-suave focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
            />
          </div>
        )}
      </div>

      <ul className="flex-1 overflow-y-auto no-scrollbar px-5 pb-40 space-y-2">
        {filtered.map(ing => {
          const defaultPrep = ing.preparations[0]!
          const check = canAddItem(draftItems, ing.id, 150, catalog, compositionRules)
          const costPer100g = defaultPrep
            ? calculateItemCost(ing, defaultPrep, 100).cost
            : 0

          return (
            <li key={ing.id}>
              <button
                disabled={!check.allowed}
                onClick={() => selectIngredient(ing.id)}
                className={[
                  'w-full bg-surface rounded-3xl p-4 shadow-sm border border-borda flex items-center gap-3 text-left',
                  'active:scale-[0.99] transition-transform',
                  !check.allowed ? 'opacity-40 cursor-not-allowed' : '',
                ].join(' ')}
              >
                {/* Placeholder icon */}
                <div className="h-12 w-12 rounded-2xl bg-creme flex items-center justify-center shrink-0 text-xl">
                  🥘
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[15px] text-verde-escuro truncate">{ing.name}</p>
                  <p className="text-xs text-texto-suave mt-0.5">
                    {formatPrice99(costPer100g)} / 100g
                  </p>
                  {!check.allowed && check.reason && (
                    <p className="text-xs text-aviso mt-0.5">{check.reason}</p>
                  )}
                  {ing.dietFlags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(ing.dietFlags as DietFlag[]).map(f => (
                        <span key={f} className="inline-flex items-center gap-0.5 h-5 px-2 rounded-full bg-verde-vivo/12 text-verde-escuro text-[10px] font-medium">
                          {DIET_FLAG_LABEL[f]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            </li>
          )
        })}

        {filtered.length === 0 && (
          <p className="text-center text-texto-suave py-10">Nenhum ingrediente encontrado.</p>
        )}
      </ul>

      <CompositionDrawer />
    </div>
  )
}
