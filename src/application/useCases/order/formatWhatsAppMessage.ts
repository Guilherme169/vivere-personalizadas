import type { OrderDraft, DraftMealEntry } from '@/domain/order'
import { orderTotal } from '@/domain/order'
import { formatMoney } from '@/domain/shared'
import {
  IngredientCategory,
  CONTAINER_LABEL,
  CONTAINER_CAPACITY_G,
} from '@/domain/meal'

export interface WhatsAppMessage {
  readonly text: string
  /** wa.me deep-link — opens WhatsApp with the message pre-filled to the business number */
  readonly url: string
}

const SEPARATOR = '─'.repeat(24)

const formatDate = (date: Date): string => {
  const d = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const t = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${d} às ${t}`
}

const formatMealBlock = (entry: DraftMealEntry, index: number, totalMeals: number): string => {
  const { meal, pricingResult } = entry
  const lines: string[] = []

  if (totalMeals > 1) {
    lines.push(`\n🍱 *Marmita ${index + 1}:*`)
  }

  const byCategory = (cat: IngredientCategory) =>
    meal.items.filter(item => item.ingredient.category === cat)

  const protein = byCategory(IngredientCategory.PROTEIN)[0]
  const carb = byCategory(IngredientCategory.CARB)[0]
  const legume = byCategory(IngredientCategory.LEGUME)[0]
  const vegetables = byCategory(IngredientCategory.VEGETABLE)
  const salads = byCategory(IngredientCategory.SALAD)
  const sauces = byCategory(IngredientCategory.SAUCE)
  const extras = byCategory(IngredientCategory.EXTRA)

  const portionSuffix = (count: number) => (count > 1 ? ` ×${count}` : '')

  lines.push(`📦 *Tamanho:* ${CONTAINER_LABEL[meal.containerSize]} — ${CONTAINER_CAPACITY_G[meal.containerSize]}g`)

  if (protein) {
    lines.push(
      `🥩 *Proteína:* ${protein.ingredient.name}${portionSuffix(protein.portion.portionCount)} (${protein.portion.gramatura}g)`,
    )
  }

  if (carb) {
    lines.push(`🍚 *Carboidrato:* ${carb.ingredient.name} (${carb.portion.gramatura}g)`)
  }

  lines.push(legume ? `🫘 *Feijão:* ${legume.ingredient.name} (${legume.portion.gramatura}g)` : '🫘 *Feijão:* Não')

  if (vegetables.length > 0) {
    lines.push(`🥦 *Legumes:* ${vegetables.map(v => v.ingredient.name).join(', ')}`)
  }

  lines.push(
    salads.length > 0
      ? `🥗 *Salada:* ${salads.map(s => s.ingredient.name).join(', ')}`
      : '🥗 *Salada:* Não',
  )
  lines.push(
    sauces.length > 0
      ? `🫙 *Molho:* ${sauces.map(s => s.ingredient.name).join(', ')}`
      : '🫙 *Molho:* Não',
  )
  lines.push(
    extras.length > 0
      ? `➕ *Adicionais:* ${extras.map(e => e.ingredient.name).join(', ')}`
      : '➕ *Adicionais:* Nenhum',
  )

  if (meal.notes) {
    lines.push(`📝 *Obs marmita:* ${meal.notes}`)
  }

  if (totalMeals > 1) {
    lines.push(`💰 *Subtotal:* ${formatMoney(pricingResult.total)}`)
  }

  return lines.join('\n')
}

// Pure function — caller provides the business WhatsApp number from tenant config.
// Returns both the human-readable text and the wa.me deep-link URL.
export const formatWhatsAppMessage = (
  draft: OrderDraft,
  /** Business phone in E.164 without '+'. Example: '5541999999999' */
  businessPhone: string,
): WhatsAppMessage => {
  const clientName = draft.customer.name.trim() || 'Não informado'
  const lines: string[] = []

  lines.push('🍱 *PEDIDO VIVERE PERSONALIZADAS*')
  lines.push(SEPARATOR)
  lines.push(`👤 *Cliente:* ${clientName}`)
  if (draft.customer.phone) lines.push(`📱 *Telefone:* ${draft.customer.phone}`)
  lines.push(`📅 ${formatDate(draft.createdAt)}`)
  lines.push('')

  draft.meals.forEach((entry, i) => {
    lines.push(formatMealBlock(entry, i, draft.meals.length))
  })

  lines.push('')
  lines.push(SEPARATOR)
  lines.push(`💰 *Total do Pedido:* ${formatMoney(orderTotal(draft))}`)

  if (draft.deliveryNotes) {
    lines.push(`📋 *Observações:* ${draft.deliveryNotes}`)
  }

  lines.push(SEPARATOR)

  const text = lines.join('\n').trim()
  const url = `https://wa.me/${businessPhone}?text=${encodeURIComponent(text)}`

  return { text, url }
}
