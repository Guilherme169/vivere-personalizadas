import { memo } from 'react'
import { cn } from '@/lib/utils'

const STEPS = ['Tamanho', 'Ingredientes', 'Revisão'] as const

interface Props {
  current: number
}

export const BuilderProgress = memo(({ current }: Props) => (
  <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={current + 1} aria-valuemax={STEPS.length}>
    {STEPS.map((label, i) => (
      <div
        key={label}
        aria-label={label}
        className={cn(
          'h-[3px] rounded-full transition-all duration-300 ease-out',
          i === current
            ? 'w-7 bg-foreground'
            : i < current
              ? 'w-3.5 bg-foreground/40'
              : 'w-3.5 bg-foreground/12',
        )}
      />
    ))}
  </div>
))
BuilderProgress.displayName = 'BuilderProgress'
