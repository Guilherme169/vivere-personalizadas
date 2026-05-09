export interface Customer {
  readonly name: string
  readonly phone: string
}

export const emptyCustomer = (): Customer => ({ name: '', phone: '' })
