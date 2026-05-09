import { Logo } from '@/features/shared/components/Logo'
import { useWizardStore } from '../store/wizardStore'

export function HeroScreen() {
  const { navigate, loadCatalog } = useWizardStore()

  function handleStart() {
    loadCatalog()
    navigate('category', 'forward')
  }

  return (
    <main className="min-h-dvh bg-creme flex flex-col">
      <header className="flex justify-center px-4 pt-12 pb-4">
        <Logo variant="verde" size="md" />
      </header>

      <section className="flex flex-col flex-1 items-center justify-center px-6 pb-36 text-center animate-fade-up">
        <Logo variant="verde" size="lg" className="mb-8" />

        <p className="text-xs font-medium uppercase tracking-[0.08em] text-texto-suave mb-4">
          Configurador de marmitas
        </p>

        <h1 className="font-display font-semibold text-[36px] leading-[1.1] text-verde-escuro mb-4">
          Monte sua marmita personalizada
        </h1>

        <p className="text-[17px] leading-relaxed text-texto-suave max-w-xs">
          Escolha ingredientes, preparo e gramatura.
          <br />
          Veja o preço em tempo real.
        </p>

        <div className="mt-10 w-full max-w-xs space-y-2 text-sm text-texto-suave">
          <div className="flex items-center gap-3">
            <span className="text-verde-vivo font-medium text-base">✓</span>
            <span>Mínimo 5 unidades por cardápio</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-verde-vivo font-medium text-base">✓</span>
            <span>Frete grátis a partir de 6 unidades</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-verde-vivo font-medium text-base">✓</span>
            <span>Prazo mínimo: 3 dias úteis</span>
          </div>
        </div>
      </section>

      <div
        className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur border-t border-borda px-5 py-4 flex flex-col gap-2 z-40"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={handleStart}
          className="w-full h-12 rounded-2xl bg-laranja text-white font-medium text-[15px] shadow-cta hover:bg-laranja-hover active:scale-[0.98] transition-all duration-200"
        >
          Começar montagem
        </button>
      </div>
    </main>
  )
}
