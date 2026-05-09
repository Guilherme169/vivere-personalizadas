import { memo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  ContainerSize,
  CONTAINER_LABEL,
  CONTAINER_CAPACITY_G,
  ALL_CONTAINER_SIZES,
} from '@/domain/meal'
import { formatMoney } from '@/domain/shared'
import type { PricingConfig } from '@/domain/pricing'

interface Props {
  selectedSize: ContainerSize | null
  onSelect: (size: ContainerSize) => void
  pricingConfig: PricingConfig
}

const SIZE_META: Record<ContainerSize, { hint: string; badge?: string }> = {
  P: { hint: 'Porção leve · 1 pessoa' },
  M: { hint: 'Porção padrão · 1 pessoa', badge: 'Mais pedido' },
  G: { hint: 'Porção farta · 1 pessoa' },
  GG: { hint: 'Porção generosa · 2 pessoas' },
}

export const SizeSelectionStep = memo(({ selectedSize, onSelect, pricingConfig }: Props) => (
  <div className="flex flex-col gap-3">
    {ALL_CONTAINER_SIZES.map((size) => (
      <SizeCard
        key={size}
        size={size}
        isSelected={size === selectedSize}
        price={formatMoney(pricingConfig.basePrices[size])}
        capacity={CONTAINER_CAPACITY_G[size]}
        hint={SIZE_META[size].hint}
        badge={SIZE_META[size].badge}
        onSelect={onSelect}
      />
    ))}
  </div>
))
SizeSelectionStep.displayName = 'SizeSelectionStep'

interface CardProps {
  size: ContainerSize
  isSelected: boolean
  price: string
  capacity: number
  hint: string
  badge?: string
  onSelect: (size: ContainerSize) => void
}

const SizeCard = memo(
  ({ size, isSelected, price, capacity, hint, badge, onSelect }: CardProps) => {
    const handleClick = useCallback(() => onSelect(size), [onSelect, size])

    return (
      <button
        onClick={handleClick}
        className={cn(
          'group relative w-full rounded-2xl border-2 px-5 py-4 text-left',
          'transition-all duration-200 ease-out',
          'active:scale-[0.982] active:duration-75',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isSelected
            ? 'border-foreground bg-foreground text-background shadow-lg'
            : 'border-border bg-card text-card-foreground hover:border-foreground/20 hover:shadow-sm',
        )}
        aria-pressed={isSelected}
      >
        {badge && !isSelected && (
          <span className="absolute right-4 top-3.5 rounded-full bg-foreground/8 px-2 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground">
            {badge}
          </span>
        )}

        <div className="flex items-center gap-4">
          {/* Size badge */}
          <div
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold tracking-wider',
              isSelected ? 'bg-background/12 text-background' : 'bg-muted text-foreground',
            )}
          >
            {size}
          </div>

          {/* Label + hint */}
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold leading-tight">
              {CONTAINER_LABEL[size]}
            </div>
            <div
              className={cn(
                'mt-0.5 text-[13px] leading-tight',
                isSelected ? 'text-background/60' : 'text-muted-foreground',
              )}
            >
              {hint}
            </div>
          </div>

          {/* Price + capacity */}
          <div className="shrink-0 text-right">
            <div className="text-[15px] font-bold tabular-nums">{price}</div>
            <div
              className={cn(
                'mt-0.5 text-[12px]',
                isSelected ? 'text-background/50' : 'text-muted-foreground',
              )}
            >
              {capacity}g
            </div>
          </div>
        </div>
      </button>
    )
  },
)
SizeCard.displayName = 'SizeCard'
