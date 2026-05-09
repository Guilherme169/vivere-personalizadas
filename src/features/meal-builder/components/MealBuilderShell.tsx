import { useState, useCallback, memo } from 'react'
import { cn } from '@/lib/utils'
import type { ContainerSize } from '@/domain/meal'
import { Button } from '@/components/ui/button'
import { useSessionBootstrap } from '@/features/session/hooks/useSessionBootstrap'
import { useMealBuilder } from '../hooks/useMealBuilder'
import { BuilderProgress } from './BuilderProgress'
import { SizeSelectionStep } from './SizeSelectionStep'

type BuilderStep = 'size' | 'ingredients' | 'notes'

const STEP_INDEX: Record<BuilderStep, number> = {
  size: 0,
  ingredients: 1,
  notes: 2,
}

export const MealBuilderShell = memo(() => {
  const session = useSessionBootstrap()
  const { startMeal } = useMealBuilder()

  const [step, setStep] = useState<BuilderStep>('size')
  const [selectedSize, setSelectedSize] = useState<ContainerSize | null>(null)

  const handleSizeContinue = useCallback(() => {
    if (!selectedSize) return
    startMeal(selectedSize)
    setStep('ingredients')
  }, [selectedSize, startMeal])

  const isLoading = session.status === 'idle' || session.status === 'loading'
  const isError = session.status === 'error'

  return (
    <div className="min-h-svh bg-background">
      <div className="relative mx-auto w-full max-w-sm">
        {/* Scrollable content area */}
        <div className="px-5 pb-36">
          {/* Header */}
          <header className="flex items-center justify-between pb-8 pt-14">
            <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              VIVERE
            </span>
            <BuilderProgress current={STEP_INDEX[step]} />
          </header>

          {/* Step heading */}
          <StepHeading step={step} />

          {/* Step content */}
          <div className="mt-7">
            {isLoading && <SizeSkeleton />}
            {isError && <ErrorState message={session.error} />}
            {!isLoading && !isError && session.data && (
              <>
                {step === 'size' && (
                  <SizeSelectionStep
                    selectedSize={selectedSize}
                    onSelect={setSelectedSize}
                    pricingConfig={session.data.pricingContext.config}
                  />
                )}
                {step !== 'size' && <ComingSoonStep step={step} />}
              </>
            )}
          </div>
        </div>

        {/* Fixed CTA */}
        <FixedCTA step={step} selectedSize={selectedSize} onSizeContinue={handleSizeContinue} />
      </div>
    </div>
  )
})
MealBuilderShell.displayName = 'MealBuilderShell'

// ── Sub-components ─────────────────────────────────────────────────────────────

const StepHeading = memo(({ step }: { step: BuilderStep }) => {
  if (step === 'size') {
    return (
      <div>
        <h1 className="text-[2rem] font-bold leading-[1.15] tracking-tight text-foreground">
          Monte sua
          <br />
          marmita.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Qual o tamanho ideal para você?
        </p>
      </div>
    )
  }
  if (step === 'ingredients') {
    return (
      <div>
        <h1 className="text-[2rem] font-bold leading-[1.15] tracking-tight text-foreground">
          Agora,
          <br />
          os ingredientes.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Escolha o que vai na sua marmita.
        </p>
      </div>
    )
  }
  return null
})
StepHeading.displayName = 'StepHeading'

interface CTAProps {
  step: BuilderStep
  selectedSize: ContainerSize | null
  onSizeContinue: () => void
}

const FixedCTA = memo(({ step, selectedSize, onSizeContinue }: CTAProps) => {
  const disabled = step === 'size' && !selectedSize

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="mx-auto w-full max-w-sm border-t border-border bg-background/95 px-5 pt-4 backdrop-blur-md"
        style={{ paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom))' }}
      >
        <Button
          className={cn(
            'h-14 w-full rounded-xl text-[15px] font-semibold tracking-wide transition-opacity duration-200',
            disabled && 'opacity-30',
          )}
          disabled={disabled}
          onClick={step === 'size' ? onSizeContinue : undefined}
        >
          {step === 'size' ? 'Continuar' : 'Próximo'}
          <ArrowRight />
        </Button>
      </div>
    </div>
  )
})
FixedCTA.displayName = 'FixedCTA'

const ArrowRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="ml-1.5"
    aria-hidden="true"
  >
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const SizeSkeleton = () => (
  <div className="flex flex-col gap-3" aria-hidden="true">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="h-[72px] w-full animate-pulse rounded-2xl border-2 border-border bg-muted"
        style={{ animationDelay: `${i * 80}ms` }}
      />
    ))}
  </div>
)

const ErrorState = ({ message }: { message: string | null }) => (
  <div className="flex flex-col items-center gap-2 py-8 text-center">
    <p className="text-sm font-medium text-destructive">Algo deu errado</p>
    <p className="text-xs text-muted-foreground">{message ?? 'Não foi possível carregar o cardápio.'}</p>
  </div>
)

const ComingSoonStep = ({ step }: { step: BuilderStep }) => (
  <div className="flex flex-col items-center gap-2 py-12 text-center">
    <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-muted text-xl">
      🥘
    </div>
    <p className="text-sm font-medium text-foreground">
      {step === 'ingredients' ? 'Seleção de ingredientes' : 'Revisão do pedido'}
    </p>
    <p className="max-w-[220px] text-xs text-muted-foreground">
      Esta etapa será implementada em breve.
    </p>
  </div>
)
