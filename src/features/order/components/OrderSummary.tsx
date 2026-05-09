import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AppHeader } from '@/features/shared/components/AppHeader'
import { useWizardStore } from '@/features/meal-builder/store/wizardStore'
import { buildWhatsAppMessage } from '@/application/useCases/order/buildWhatsAppMessage'
import { services } from '@/infrastructure/ServiceFactory'
import { calculateMealPrice, calculateOrderPricing, formatPrice99, formatBRL } from '@/domain/pricing'
import { totalWeight, suggestContainer, CONTAINER_LABEL, computeDietBadges, DIET_FLAG_LABEL } from '@/domain/meal'
import { CATEGORY_LABEL } from '@/domain/catalog'

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function OrderSummary() {
  const [accordionOpen, setAccordionOpen] = useState(false)
  const {
    navigate, cardapios, catalog, pricingConfig, customerPricingRules,
    customer, fulfillment, notes, updateCustomer, setFulfillment, setNotes,
  } = useWizardStore()

  const pricing = calculateOrderPricing(cardapios, catalog, pricingConfig, customerPricingRules, fulfillment)

  const canSubmit = customer.name.trim().length > 0 && customer.phone.replace(/\D/g, '').length >= 10

  function handleSubmit() {
    const payload = buildWhatsAppMessage(
      cardapios, customer, fulfillment, notes, catalog, pricingConfig, customerPricingRules,
    )

    const order = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      cardapios,
      customer,
      fulfillment,
      notes: notes || undefined,
    }
    services.orderRepo.persist(order).catch(err => {
      console.error('Failed to persist order:', err)
      alert('Não conseguimos salvar seu pedido no sistema, mas o WhatsApp foi aberto. Por favor, envie a mensagem para nosso atendente.')
    })

    window.open(payload.url, '_blank')
    navigate('confirmation', 'forward')
  }

  return (
    <div className="min-h-dvh bg-creme flex flex-col">
      <AppHeader onBack={() => navigate('add-more', 'back')} />

      <div className="px-5 pt-2 pb-4">
        <h2 className="font-display font-semibold text-[28px] leading-[1.2] text-verde-escuro">
          Resumo do pedido
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-36 space-y-4">
        {/* Cardápios */}
        {cardapios.map((c, i) => {
          const { finalPrice } = calculateMealPrice(c.items, catalog, pricingConfig)
          const weight = totalWeight(c.items)
          const container = suggestContainer(weight)
          const badges = computeDietBadges(c.items, catalog)

          return (
            <div key={c.id} className="bg-surface rounded-3xl p-5 shadow-md border border-borda">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-verde-escuro">Cardápio {i + 1}</p>
                  <p className="text-xs text-texto-suave">{weight}g · {CONTAINER_LABEL[container]}</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-semibold text-[20px] text-verde-escuro">{formatPrice99(finalPrice)}</p>
                  <p className="text-xs text-texto-suave">× {c.quantity} = {formatBRL(finalPrice * c.quantity)}</p>
                </div>
              </div>

              <ul className="space-y-1 mb-3">
                {c.items.map(item => {
                  const ing = catalog.find(x => x.id === item.ingredientId)
                  const prep = ing?.preparations.find(p => p.id === item.preparationId)
                  if (!ing || !prep) return null
                  return (
                    <li key={item.ingredientId} className="text-sm text-texto-suave flex justify-between">
                      <span>{CATEGORY_LABEL[ing.category]}: {ing.name} — {prep.name}</span>
                      <span className="text-xs ml-2 shrink-0">{item.grams}g</span>
                    </li>
                  )
                })}
              </ul>

              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {badges.map(f => (
                    <span key={f} className="inline-flex items-center gap-0.5 h-6 px-2 rounded-full bg-verde-vivo/12 text-verde-escuro text-[10px] font-medium">
                      ✓ {DIET_FLAG_LABEL[f]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Pricing */}
        <div className="bg-surface rounded-3xl p-5 shadow-md border border-borda">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-texto-suave">Subtotal ({pricing.totalUnits} marmitas)</span>
              <span className="text-verde-escuro">{formatBRL(pricing.subtotalMarmitas)}</span>
            </div>
            {pricing.descontoPct > 0 && (
              <div className="flex justify-between text-sucesso">
                <span>Desconto {(pricing.descontoPct * 100).toFixed(0)}%</span>
                <span>-{formatBRL(pricing.descontoBRL)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-texto-suave">Frete</span>
              <span className={pricing.frete === 0 ? 'text-sucesso' : 'text-verde-escuro'}>
                {pricing.frete === 0 ? 'Grátis' : formatBRL(pricing.frete)}
              </span>
            </div>
            <div className="border-t border-borda pt-2 flex justify-between font-semibold text-base">
              <span className="text-verde-escuro">Total</span>
              <span className="font-display text-[22px] text-verde-escuro">{formatBRL(pricing.totalPedido)}</span>
            </div>
          </div>

          {/* Accordion "Como calculamos" */}
          <button
            onClick={() => setAccordionOpen(o => !o)}
            className="flex items-center gap-1 text-xs text-texto-suave mt-3"
          >
            <ChevronDown size={12} className={accordionOpen ? 'rotate-180' : ''} style={{ transition: 'transform 200ms' }} />
            Como calculamos o preço
          </button>
          {accordionOpen && (
            <p className="text-xs text-texto-suave mt-2 leading-relaxed">
              O preço de cada marmita é calculado com base no custo dos ingredientes (peso real após preparo), mais os custos fixos de embalagem, entrega e operação, com margem de lucro aplicada.
              O valor termina sempre em ,99 — formatação padrão. Frete grátis a partir de 6 unidades. Descontos de 5% (≥11 un.) ou 10% (≥16 un.) aplicados sobre o subtotal.
            </p>
          )}
        </div>

        {/* Contact form */}
        <div className="bg-surface rounded-3xl p-5 shadow-md border border-borda space-y-3">
          <h3 className="font-display font-medium text-[18px] text-verde-escuro">Seus dados</h3>

          <div>
            <label className="text-xs font-medium text-texto-suave uppercase tracking-wide block mb-1.5">Nome</label>
            <input
              type="text"
              placeholder="Seu nome completo"
              value={customer.name}
              onChange={e => updateCustomer({ name: e.target.value })}
              className="w-full h-12 rounded-2xl bg-creme border border-borda px-4 text-[15px] placeholder:text-texto-suave focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-texto-suave uppercase tracking-wide block mb-1.5">Telefone</label>
            <input
              type="tel"
              placeholder="(51) 99999-9999"
              value={customer.phone}
              onChange={e => updateCustomer({ phone: maskPhone(e.target.value) })}
              className="w-full h-12 rounded-2xl bg-creme border border-borda px-4 text-[15px] placeholder:text-texto-suave focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-texto-suave uppercase tracking-wide block mb-1.5">Modo</label>
            <div className="flex gap-2">
              {(['entrega', 'retirada'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFulfillment(f)}
                  className={[
                    'flex-1 h-11 rounded-xl text-sm font-medium transition-all',
                    fulfillment === f
                      ? 'bg-verde-escuro text-white'
                      : 'border border-borda text-verde-escuro hover:bg-verde-escuro/5',
                  ].join(' ')}
                >
                  {f === 'entrega' ? '🚚 Entrega' : '🏪 Retirada'}
                </button>
              ))}
            </div>
          </div>

          {fulfillment === 'entrega' && (
            <div>
              <label className="text-xs font-medium text-texto-suave uppercase tracking-wide block mb-1.5">Endereço</label>
              <input
                type="text"
                placeholder="Rua, número, bairro, cidade"
                value={customer.address ?? ''}
                onChange={e => updateCustomer({ address: e.target.value })}
                className="w-full h-12 rounded-2xl bg-creme border border-borda px-4 text-[15px] placeholder:text-texto-suave focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-texto-suave uppercase tracking-wide block mb-1.5">Observações (opcional)</label>
            <textarea
              placeholder="Restrições alimentares, preferências de entrega..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-2xl bg-creme border border-borda px-4 py-3 text-[15px] placeholder:text-texto-suave focus:outline-none focus:ring-2 focus:ring-verde-escuro/30 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div
        className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur border-t border-borda px-5 py-4 flex flex-col gap-2 z-40 shadow-lg"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={[
            'w-full h-12 rounded-2xl font-medium text-[15px] transition-all flex items-center justify-center gap-2',
            canSubmit
              ? 'bg-laranja text-white shadow-cta hover:bg-laranja-hover active:scale-[0.98]'
              : 'bg-laranja/40 text-white cursor-not-allowed',
          ].join(' ')}
        >
          💬 Continuar no WhatsApp
        </button>
        {!canSubmit && (
          <p className="text-center text-xs text-texto-suave">Preencha nome e telefone para continuar</p>
        )}
      </div>
    </div>
  )
}
