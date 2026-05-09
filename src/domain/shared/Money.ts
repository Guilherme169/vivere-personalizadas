// Stored in cents to avoid floating-point arithmetic errors
export interface Money {
  readonly amountInCents: number
  readonly currency: 'BRL'
}

export const money = (cents: number): Money => ({
  amountInCents: Math.max(0, Math.round(cents)),
  currency: 'BRL',
})

export const moneyFromReais = (reais: number): Money =>
  money(Math.round(reais * 100))

export const addMoney = (a: Money, b: Money): Money =>
  money(a.amountInCents + b.amountInCents)

export const subtractMoney = (a: Money, b: Money): Money =>
  money(a.amountInCents - b.amountInCents)

export const multiplyMoney = (m: Money, factor: number): Money =>
  money(Math.round(m.amountInCents * factor))

export const isZeroMoney = (m: Money): boolean => m.amountInCents === 0

export const compareMoney = (a: Money, b: Money): number =>
  a.amountInCents - b.amountInCents

export const formatMoney = (m: Money): string => {
  const value = (m.amountInCents / 100).toFixed(2).replace('.', ',')
  return `R$ ${value}`
}

export const ZERO_MONEY: Money = money(0)
