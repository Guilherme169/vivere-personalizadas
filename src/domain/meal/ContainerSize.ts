export const ContainerSize = {
  SMALL: 'P',
  MEDIUM: 'M',
  LARGE: 'G',
  EXTRA_LARGE: 'GG',
} as const

export type ContainerSize = (typeof ContainerSize)[keyof typeof ContainerSize]

export const CONTAINER_LABEL: Record<ContainerSize, string> = {
  P: 'Pequena',
  M: 'Média',
  G: 'Grande',
  GG: 'Extra Grande',
}

export const CONTAINER_CAPACITY_G: Record<ContainerSize, number> = {
  P: 500,
  M: 700,
  G: 900,
  GG: 1100,
}

export const ALL_CONTAINER_SIZES = Object.values(ContainerSize) as ContainerSize[]
