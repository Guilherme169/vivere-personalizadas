import { AppHeader } from '@/features/shared/components/AppHeader'
import { useWizardStore } from '../store/wizardStore'
import { CompositionDrawer } from './CompositionDrawer'
import { isCategoryFull, categorySelectedCount } from '@/domain/meal'
import { CATEGORY_LABEL, CATEGORY_EMOJI } from '@/domain/catalog'
import type { Category } from '@/domain/catalog'

const CATEGORIES: Category[] = ['protein', 'carb', 'vegetable', 'seasoning', 'dairy', 'other']

export function CategoryStep() {
  const { navigate, selectCategory, draftItems, catalog, compositionRules, cardapios } = useWizardStore()

  const cardapioNumber = cardapios.length + 1

  return (
    <div className="min-h-dvh bg-creme flex flex-col">
      <AppHeader
        onBack={() => navigate(cardapios.length > 0 ? 'add-more' : 'hero', 'back')}
      />

      <div className="px-5 pt-2 pb-4">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-texto-suave">
          Cardápio {cardapioNumber}
        </p>
        <h2 className="font-display font-semibold text-[28px] leading-[1.2] text-verde-escuro mt-1">
          Escolha a categoria
        </h2>
        <p className="text-sm text-texto-suave mt-1">Toque para escolher um ingrediente</p>
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 pb-40">
        {CATEGORIES.map(cat => {
          const full = isCategoryFull(draftItems, cat, catalog, compositionRules)
          const count = categorySelectedCount(draftItems, cat, catalog)
          const max = compositionRules.maxItemsByCategory[cat]

          return (
            <button
              key={cat}
              disabled={full}
              onClick={() => selectCategory(cat)}
              className={[
                'bg-surface rounded-3xl p-5 shadow-md border border-borda flex flex-col items-center gap-2 aspect-square',
                'active:scale-[0.98] transition-transform',
                full ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-lg',
              ].join(' ')}
            >
              <span className="text-3xl">{CATEGORY_EMOJI[cat]}</span>
              <span className="font-medium text-[13px] text-verde-escuro text-center leading-tight">
                {CATEGORY_LABEL[cat]}
              </span>
              <span className="text-xs text-texto-suave">
                {count}/{max}
              </span>
            </button>
          )
        })}
      </div>

      <CompositionDrawer />
    </div>
  )
}
