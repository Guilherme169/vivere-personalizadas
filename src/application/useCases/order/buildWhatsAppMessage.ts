import type { Cardapio } from '@/domain/cardapio'
import type { Ingredient } from '@/domain/catalog'
import type { Customer } from '@/domain/customer'
import type { Fulfillment } from '@/domain/order'
import type { FulfillmentZone } from '@/domain/fulfillment'
import type { PricingConfig, CustomerPricingRules, OrderPricing } from '@/domain/pricing'
import { CATEGORY_LABEL } from '@/domain/catalog'
import { calculateMealPrice, calculateOrderPricing, formatPrice99, formatBRL } from '@/domain/pricing'
import { suggestContainer, computeDietBadges, DIET_FLAG_LABEL } from '@/domain/meal'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '555180889884'

function buildCardapioBlock(
  cardapio: Cardapio,
  index: number,
  catalog: Ingredient[],
  config: PricingConfig,
): string {
  const { finalPrice } = calculateMealPrice(cardapio.items, catalog, config)
  const totalGrams = cardapio.items.reduce((s, i) => s + i.grams, 0)
  const container = suggestContainer(totalGrams)
  const dietBadges = computeDietBadges(cardapio.items, catalog)
  const restricoes = dietBadges.length > 0
    ? dietBadges.map(f => DIET_FLAG_LABEL[f]).join(', ')
    : '—'

  const lines: string[] = []
  lines.push(`🥗 Cardápio ${index + 1} — ${cardapio.quantity} unidades`)

  for (const item of cardapio.items) {
    const ing = catalog.find(i => i.id === item.ingredientId)
    const prep = ing?.preparations.find(p => p.id === item.preparationId)
    if (!ing || !prep) continue
    lines.push(`• ${CATEGORY_LABEL[ing.category]}: ${ing.name} - ${prep.name} - ${item.grams}g`)
  }

  lines.push(`Peso/marmita: ${totalGrams}g  •  Recipiente: ${container}`)
  lines.push(`Restrições: ${restricoes}`)
  lines.push(`Preço unitário: ${formatPrice99(finalPrice)}`)

  return lines.join('\n')
}

export interface WhatsAppPayload {
  text: string
  url: string
}

export function buildWhatsAppMessage(
  cardapios: Cardapio[],
  customer: Customer,
  fulfillment: Fulfillment,
  notes: string | undefined,
  catalog: Ingredient[],
  config: PricingConfig,
  customerRules: CustomerPricingRules,
  zone: FulfillmentZone | null = null,
): WhatsAppPayload {
  const pricing: OrderPricing = calculateOrderPricing(cardapios, catalog, config, customerRules, fulfillment)

  const lines: string[] = []
  lines.push('Olá, Vivere! Quero pedir minhas marmitas personalizadas.')
  lines.push('')

  cardapios.forEach((c, i) => {
    lines.push(buildCardapioBlock(c, i, catalog, config))
    lines.push('')
  })

  lines.push(`📦 Total: ${pricing.totalUnits} unidades`)
  lines.push(`💰 Subtotal marmitas: ${formatBRL(pricing.subtotalMarmitas)}`)

  if (fulfillment === 'entrega' && zone?.requiresScheduling) {
    lines.push('🚚 Frete: A combinar via WhatsApp')
  } else {
    lines.push(pricing.frete === 0 ? '🚚 Frete: Frete grátis' : `🚚 Frete: ${formatBRL(pricing.frete)}`)
  }

  if (pricing.descontoPct > 0) {
    lines.push(`🏷️ Desconto: -${(pricing.descontoPct * 100).toFixed(0)}% (${formatBRL(pricing.descontoBRL)})`)
  }

  lines.push(`💵 Total: ${formatBRL(pricing.totalPedido)}`)
  lines.push('')
  lines.push(`👤 ${customer.name}`)
  lines.push(`📞 ${customer.phone}`)

  if (fulfillment === 'retirada') {
    lines.push('🏠 Vou retirar')
  } else {
    if (zone) {
      lines.push(`🏙️ Cidade: ${zone.cityName}`)
    }
    lines.push(`🏠 Endereço: ${customer.address ?? '—'}`)
    if (zone?.requiresScheduling) {
      lines.push(`   ⚠ ${zone.deliveryFeeNote ?? 'Frete e dia de entrega combinados via WhatsApp'}`)
    }
  }

  lines.push(`📝 Observações: ${notes || '—'}`)
  lines.push('')
  lines.push('Aguardo confirmação do prazo e fechamento. Obrigado!')

  const text = lines.join('\n')
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`

  return { text, url }
}
