import { Check, ChevronLeft } from 'lucide-react'
import { Logo } from '@/features/shared/components/Logo'
import { AppFooter } from '@/features/shared/components/AppFooter'
import { useWizardStore } from '../store/wizardStore'

export function HeroScreen() {
  const { navigate, customer } = useWizardStore()

  function handleStart() {
    navigate('category', 'forward')
  }

  return (
    <main className="min-h-dvh bg-creme flex flex-col">
      <div className="px-5 pt-4">
        <button
          onClick={() => navigate('lead-capture', 'back')}
          className="h-9 w-9 rounded-xl bg-surface border border-borda flex items-center justify-center text-verde-escuro hover:bg-verde-escuro/5 transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
      </div>

      <section className="flex flex-col flex-1 items-center justify-center px-6 pt-6 pb-36 text-center animate-fade-up">
        <Logo withSlogan size="xl" className="mb-10" />

        {customer && (
          <p className="text-base font-medium text-verde-vivo mb-2">
            Olá, {customer.name}!
          </p>
        )}

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

      <AppFooter />

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
