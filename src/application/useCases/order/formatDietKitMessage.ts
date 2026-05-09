import type { WhatsAppMessage } from './formatWhatsAppMessage'

export interface DietKitOrder {
  readonly mode: 'diet-text' | 'guided'
  readonly dietText: string
  readonly mealsPerWeek: number
  readonly frequencyLabel: string
  readonly notes: string
}

const INTRO: Record<DietKitOrder['mode'], string> = {
  'diet-text': 'Como me alimento:',
  'guided': 'Minha refeição ideal:',
}

export const formatDietKitMessage = (
  order: DietKitOrder,
  businessPhone: string,
): WhatsAppMessage => {
  const lines: string[] = [
    '🥗 *Pedido VIVERE Personalizadas*',
    '',
    `*${INTRO[order.mode]}*`,
    order.dietText.trim(),
    '',
    `*Kit semanal:* ${order.frequencyLabel}`,
  ]

  if (order.notes.trim()) {
    lines.push('', `*Observações:* ${order.notes.trim()}`)
  }

  lines.push('', '—', '_Enviado pelo app VIVERE_')

  const text = lines.join('\n')
  const url = `https://wa.me/${businessPhone}?text=${encodeURIComponent(text)}`

  return { text, url }
}
