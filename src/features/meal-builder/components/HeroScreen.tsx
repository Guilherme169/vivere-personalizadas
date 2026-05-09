import { useEffect } from 'react'
import { Check } from 'lucide-react'
import { Logo } from '@/features/shared/components/Logo'
import { useWizardStore } from '../store/wizardStore'

export function HeroScreen() {
  const { navigate, loadCatalog } = useWizardStore()

  // Pre-load catalog while user reads the hero, so it's ready on click
  useEffect(() => { loadCatalog() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleStart() {
    navigate('category', 'forward')
  }

  return (
    <main className="min-h-dvh bg-creme flex flex-col">
      <section className="flex flex-col flex-1 items-center justify-center px-6 pt-16 pb-36 text-center animate-fade-up">
        {/* Lockup com slogan — uma única âncora visual da marca */}
        <Logo withSlogan size="xl" className="mb-10" />

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

        <ul className="mt-10 w-full max-w-xs space-y-3 text-[15px] text-texto-suave">
          <li className="flex items-center gap-3">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-verde-vivo/15 text-verde-escuro shrink-0">
              <Check size={14} strokeWidth={2.5} />
            </span>
            <span>Mínimo 5 unidades por cardápio</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-verde-vivo/15 text-verde-escuro shrink-0">
              <Check size={14} strokeWidth={2.5} />
            </span>
            <span>Frete grátis a partir de 6 unidades</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-verde-vivo/15 text-verde-escuro shrink-0">
              <Check size={14} strokeWidth={2.5} />
            </span>
            <span>Prazo mínimo: 3 dias úteis</span>
          </li>
        </ul>
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
