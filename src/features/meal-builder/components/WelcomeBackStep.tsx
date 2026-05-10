import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWizardStore } from '../store/wizardStore'
import { Logo } from '@/features/shared/components/Logo'
import { CATEGORY_LABEL } from '@/domain/catalog'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
}

export function WelcomeBackStep() {
  const routerNavigate = useNavigate()
  const { customer, lastOrder, catalog, navigate, loadOrderIntoDraft } = useWizardStore()

  useEffect(() => {
    if (!lastOrder) navigate('hero', 'forward')
  }, [lastOrder, navigate])

  if (!lastOrder) return null

  const totalUnits = lastOrder.cardapios.reduce((s, c) => s + c.quantity, 0)

  function handleRepeat() {
    loadOrderIntoDraft(lastOrder!)
    navigate('summary', 'forward')
  }

  function handleEdit() {
    loadOrderIntoDraft(lastOrder!)
    navigate('add-more', 'forward')
  }

  return (
    <main className="min-h-dvh bg-creme flex flex-col">
      <section className="flex flex-col items-center px-6 pt-14 pb-4">
        <Logo size="lg" className="mb-6" />

        <p className="text-xs font-medium uppercase tracking-[0.08em] text-texto-suave mb-2">
          Bem-vindo de volta
        </p>
        <h1 className="font-display font-semibold text-[26px] leading-[1.15] text-verde-escuro mb-5 text-center">
          Olá de novo,<br />{customer?.name ?? ''}!
        </h1>

        {/* Last order card */}
        <div className="w-full max-w-sm bg-surface rounded-3xl p-5 shadow-md border border-borda">
          <p className="text-xs font-medium uppercase tracking-wide text-texto-suave mb-3">
            Seu último pedido · {formatDate(lastOrder.createdAt)}
          </p>

          {lastOrder.cardapios.map((c, i) => (
            <div key={c.id ?? i} className="mb-3 last:mb-0">
              <p className="text-sm font-medium text-verde-escuro mb-1">
                Cardápio {i + 1} — {c.quantity} unidades
              </p>
              <ul className="space-y-0.5">
                {c.items.slice(0, 5).map(item => {
                  const ing = catalog.find(x => x.id === item.ingredientId)
                  return (
                    <li key={item.ingredientId} className="text-xs text-texto-suave">
                      · {ing ? `${CATEGORY_LABEL[ing.category]}: ${ing.name}` : item.ingredientId}
                      {item.grams > 0 ? ` (${item.grams}g)` : ''}
                    </li>
                  )
                })}
                {c.items.length > 5 && (
                  <li className="text-xs text-texto-suave">· e mais {c.items.length - 5} ingrediente(s)…</li>
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

      {/* Action buttons */}
      <div className="px-6 pt-4 pb-8 flex flex-col gap-2 max-w-sm w-full mx-auto"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={handleRepeat}
          className="w-full h-12 rounded-2xl bg-laranja text-white font-medium text-[15px] shadow-cta hover:bg-laranja-hover active:scale-[0.98] transition-all"
        >
          Repetir esse pedido
        </button>

        <button
          onClick={handleEdit}
          className="w-full h-12 rounded-2xl border border-verde-escuro text-verde-escuro font-medium text-[15px] hover:bg-verde-escuro/5 active:scale-[0.98] transition-all"
        >
          Editar antes de pedir
        </button>

        <button
          onClick={() => routerNavigate('/historico')}
          className="w-full h-12 rounded-2xl text-texto-suave font-medium text-[15px] hover:bg-verde-escuro/5 active:scale-[0.98] transition-all"
        >
          Ver histórico
        </button>

        <button
          onClick={() => navigate('category', 'forward')}
          className="w-full h-12 rounded-2xl text-texto-suave font-medium text-[14px] hover:bg-verde-escuro/5 active:scale-[0.98] transition-all"
        >
          Montar uma nova marmita
        </button>
      </div>
    </main>
  )
}
