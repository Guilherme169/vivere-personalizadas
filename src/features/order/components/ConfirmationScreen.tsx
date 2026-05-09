import { Logo } from '@/features/shared/components/Logo'
import { useWizardStore } from '@/features/meal-builder/store/wizardStore'

export function ConfirmationScreen() {
  const { customer, navigate, resetDraft } = useWizardStore()

  function handleNewOrder() {
    resetDraft()
    navigate('hero', 'back')
  }

  return (
    <div className="min-h-dvh bg-creme flex flex-col items-center justify-center px-6 text-center animate-fade-up">
      <Logo variant="verde" size="md" className="mb-8" />

      <div className="text-5xl mb-6">✅</div>

      <h1 className="font-display font-semibold text-[32px] leading-[1.1] text-verde-escuro mb-3">
        Pedido enviado!
      </h1>

      <p className="text-[17px] text-texto-suave leading-relaxed max-w-xs mb-2">
        Olá, <strong className="text-verde-escuro">{customer.name || 'cliente'}</strong>!
        Em breve nosso atendente vai confirmar seu pedido pelo WhatsApp.
      </p>

      <p className="text-sm text-texto-suave mb-10">
        Prazo mínimo de preparo: <strong>3 dias úteis</strong>.
      </p>

      <button
        onClick={handleNewOrder}
        className="h-12 px-8 rounded-2xl border border-verde-escuro text-verde-escuro font-medium text-[15px] hover:bg-verde-escuro/5 active:scale-[0.98] transition-all"
      >
        Fazer novo pedido
      </button>
    </div>
  )
}
