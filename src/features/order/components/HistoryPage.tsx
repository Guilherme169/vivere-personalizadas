import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useWizardStore } from '@/features/meal-builder/store/wizardStore'
import { CATEGORY_LABEL } from '@/domain/catalog'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function HistoryPage() {
  const routerNavigate = useNavigate()
  const { lastOrder, customer, catalog } = useWizardStore()

  return (
    <main className="min-h-dvh bg-creme flex flex-col">
      <header className="flex items-center gap-3 px-5 py-4 border-b border-borda bg-surface">
        <button
          onClick={() => routerNavigate(-1)}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-verde-escuro hover:bg-verde-escuro/5 active:scale-[0.97] transition-all"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <h1 className="font-display font-semibold text-[20px] text-verde-escuro">Histórico de pedidos</h1>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 space-y-4">
        {!customer && (
          <p className="text-center text-texto-suave py-16">
            Faça um pedido para ver seu histórico aqui.
          </p>
        )}

        {customer && !lastOrder && (
          <p className="text-center text-texto-suave py-16">
            Nenhum pedido encontrado para {customer.name}.
          </p>
        )}

        {lastOrder && (
          <div className="bg-surface rounded-3xl p-5 shadow-md border border-borda">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium text-verde-escuro">Pedido mais recente</p>
                <p className="text-xs text-texto-suave">{formatDate(lastOrder.createdAt)}</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-verde-vivo/10 text-verde-escuro">
                {lastOrder.fulfillment === 'retirada' ? 'Retirada' : 'Entrega'}
              </span>
            </div>

            {lastOrder.cardapios.map((c, i) => (
              <div key={c.id ?? i} className="mb-3 last:mb-0">
                <p className="text-sm font-medium text-verde-escuro mb-1">
                  Cardápio {i + 1} — {c.quantity} unidades
                </p>
                <ul className="space-y-0.5">
                  {c.items.map(item => {
                    const ing = catalog.find(x => x.id === item.ingredientId)
                    const prep = ing?.preparations.find(p => p.id === item.preparationId)
                    return (
                      <li key={item.ingredientId} className="text-xs text-texto-suave flex justify-between">
                        <span>
                          {ing ? `${CATEGORY_LABEL[ing.category]}: ${ing.name}` : item.ingredientId}
                          {prep ? ` — ${prep.name}` : ''}
                        </span>
                        {item.grams > 0 && <span className="ml-2 shrink-0">{item.grams}g</span>}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}

            <div className="mt-3 pt-3 border-t border-borda text-xs text-texto-suave">
              {lastOrder.cardapios.reduce((s, c) => s + c.quantity, 0)} marmitas no total
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
