import { useEffect } from 'react'
import { useWizardStore } from '../store/wizardStore'
import { Logo } from '@/features/shared/components/Logo'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
}

export function WelcomeBackStep() {
  const { customer, lastOrder, catalog, navigate } = useWizardStore()

  useEffect(() => {
    if (!lastOrder) navigate('hero', 'forward')
  }, [lastOrder, navigate])

  if (!lastOrder) return null

  const totalUnits = lastOrder.cardapios.reduce((s, c) => s + c.quantity, 0)

  return (
    <main className="min-h-dvh bg-creme flex flex-col">
      <section className="flex flex-col flex-1 items-center px-6 pt-16 pb-40">
        <Logo size="lg" className="mb-8" />

        <p className="text-xs font-medium uppercase tracking-[0.08em] text-texto-suave mb-2">
          Bem-vindo de volta
        </p>
        <h1 className="font-display font-semibold text-[28px] leading-[1.15] text-verde-escuro mb-6 text-center">
          Olá de novo,<br />{customer?.name ?? ''}!
        </h1>

        {/* Last order card */}
        <div className="w-full max-w-sm bg-surface rounded-3xl p-5 shadow-md border border-borda mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-texto-suave mb-3">
            Seu último pedido · {formatDate(lastOrder.createdAt)}
          </p>

          {lastOrder.cardapios.map((c, i) => (
            <div key={c.id ?? i} className="mb-3 last:mb-0">
              <p className="text-sm font-medium text-verde-escuro mb-1">
                Cardápio {i + 1} — {c.quantity} unidades
              </p>
              <ul className="space-y-0.5">
                {c.items.slice(0, 4).map(item => {
                  const ing = catalog.find(x => x.id === item.ingredientId)
                  return (
                    <li key={item.ingredientId} className="text-xs text-texto-suave">
                      · {ing ? ing.name : item.ingredientId}{item.grams > 0 ? ` (${item.grams}g)` : ''}
                    </li>
                  )
                })}
                {c.items.length > 4 && (
                  <li className="text-xs text-texto-suave">· e mais {c.items.length - 4} ingrediente(s)…</li>
                )}
              </ul>
            </div>
          ))}

          <div className="mt-3 pt-3 border-t border-borda flex justify-between text-xs text-texto-suave">
            <span>{totalUnits} marmitas no total</span>
            <span>{lastOrder.fulfillment === 'retirada' ? 'Retirada' : 'Entrega'}</span>
          </div>
        </div>
      </section>

      <div
        className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur border-t border-borda px-5 py-4 z-40"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => navigate('hero', 'forward')}
          className="w-full h-12 rounded-2xl bg-laranja text-white font-medium text-[15px] shadow-cta hover:bg-laranja-hover active:scale-[0.98] transition-all"
        >
          Fazer novo pedido
        </button>
      </div>
    </main>
  )
}
