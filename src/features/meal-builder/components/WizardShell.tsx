import { useWizardStore } from '../store/wizardStore'
import { LeadCaptureStep } from './LeadCaptureStep'
import { HeroScreen } from './HeroScreen'
import { CategoryStep } from './CategoryStep'
import { IngredientStep } from './IngredientStep'
import { PreparationStep } from './PreparationStep'
import { GramaturaStep } from './GramaturaStep'
import { QuantityStep } from './QuantityStep'
import { AddMoreStep } from './AddMoreStep'
import { OrderSummary } from '@/features/order/components/OrderSummary'
import { ConfirmationScreen } from '@/features/order/components/ConfirmationScreen'

export function WizardShell() {
  const { step, direction } = useWizardStore()

  const animClass = direction === 'forward' ? 'animate-step-forward' : 'animate-step-back'

  function renderStep() {
    switch (step) {
      case 'lead-capture': return <LeadCaptureStep />
      case 'hero':         return <HeroScreen />
      case 'category':     return <CategoryStep />
      case 'ingredient':   return <IngredientStep />
      case 'preparation':  return <PreparationStep />
      case 'gramatura':    return <GramaturaStep />
      case 'quantity':     return <QuantityStep />
      case 'add-more':     return <AddMoreStep />
      case 'summary':      return <OrderSummary />
      case 'confirmation': return <ConfirmationScreen />
    }
  }

  return (
    <div key={step} className={animClass}>
      {renderStep()}
    </div>
  )
}
