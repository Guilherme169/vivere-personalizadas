import { AppHeader } from '@/features/shared/components/AppHeader'
import { CategoryIcon } from '@/features/shared/components/CategoryIcon'
import { useWizardStore } from '../store/wizardStore'
import { CompositionDrawer } from './CompositionDrawer'

export function PreparationStep() {
  const { navigate, selectedIngredientId, catalog, selectPreparation } = useWizardStore()
  const ingredient = catalog.find(i => i.id === selectedIngredientId)

  if (!ingredient) return null

  return (
    <div className="min-h-dvh bg-creme flex flex-col">
      <AppHeader onBack={() => navigate('ingredient', 'back')} />

      <div className="px-5 pt-2 pb-6">
        <h2 className="font-display font-semibold text-[28px] leading-[1.2] text-verde-escuro">
          Forma de preparo
        </h2>
        <p className="text-sm text-texto-suave mt-1">{ingredient.name}</p>
      </div>

      <div className="flex flex-col gap-3 px-5 pb-40">
        {ingredient.preparations.map(prep => (
          <button
            key={prep.id}
            onClick={() => selectPreparation(prep.id)}
            className="bg-surface rounded-3xl p-6 shadow-md border border-borda flex flex-col items-center gap-2 active:scale-[0.98] transition-transform text-center"
          >
            <div className="h-12 w-12 rounded-2xl bg-verde-vivo/10 flex items-center justify-center text-verde-escuro">
              <CategoryIcon category={ingredient.category} size={24} />
            </div>
            <span className="font-medium text-[17px] text-verde-escuro">{prep.name}</span>
          </button>
        ))}
      </div>

      <CompositionDrawer />
    </div>
  )
}
