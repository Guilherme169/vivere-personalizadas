import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { AppHeader } from '@/features/shared/components/AppHeader'
import { useWizardStore } from '../store/wizardStore'
import { CompositionDrawer } from './CompositionDrawer'
import { canAddItem } from '@/domain/meal'
import { calculateItemCost, formatPrice99 } from '@/domain/pricing'

const QUICK_GRAMS = [100, 120, 150, 180]

export function GramaturaStep() {
  const [custom, setCustom] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const {
    navigate, selectedIngredientId, selectedPreparationId,
    catalog, draftItems, compositionRules, addItemToDraft,
  } = useWizardStore()

  const ingredient = catalog.find(i => i.id === selectedIngredientId)
  const preparation = ingredient?.preparations.find(p => p.id === selectedPreparationId)

  if (!ingredient || !preparation) return null

  function handleSelect(grams: number) {
    const check = canAddItem(draftItems, ingredient!.id, grams, catalog, compositionRules)
    if (!check.allowed) return
    addItemToDraft(grams)
  }

  function handleCustomSubmit() {
    const g = parseInt(custom, 10)
    if (isNaN(g) || g < 50 || g > 500) return
    handleSelect(Math.round(g / 10) * 10)
  }

  return (
    <div className="min-h-dvh bg-creme flex flex-col">
      <AppHeader onBack={() => navigate(ingredient.preparations.length > 1 ? 'preparation' : 'ingredient', 'back')} />

      <div className="px-5 pt-2 pb-6">
        <h2 className="font-display font-semibold text-[28px] leading-[1.2] text-verde-escuro">
          Gramatura
        </h2>
        <p className="text-sm text-texto-suave mt-1">{ingredient.name} · {preparation.name}</p>
      </div>

      <div className="px-5 pb-40 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {QUICK_GRAMS.map(g => {
            const cost = calculateItemCost(ingredient, preparation, g).cost
            const check = canAddItem(draftItems, ingredient.id, g, catalog, compositionRules)
            return (
              <button
                key={g}
                disabled={!check.allowed}
                onClick={() => handleSelect(g)}
                className={[
                  'h-20 px-5 rounded-3xl border border-borda bg-surface shadow-sm flex flex-col items-center justify-center gap-1',
                  'active:scale-[0.98] transition-transform',
                  !check.allowed ? 'opacity-40 cursor-not-allowed' : 'hover:border-verde-escuro',
                ].join(' ')}
              >
                <span className="font-display font-semibold text-[22px] text-verde-escuro">{g}g</span>
                <span className="text-xs text-texto-suave">+ {formatPrice99(cost)}</span>
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
            + Outra gramatura
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              min={50}
              max={500}
              step={10}
              placeholder="Ex: 250"
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
        )}
      </div>

      <CompositionDrawer />
    </div>
  )
}
