// Public API of the application layer.
// Features import from here; they never import from domain or infrastructure directly
// (except for domain types used as function parameters — those are transparent).

export type { MenuRepository } from './ports/MenuRepository'
export type { PricingRepository } from './ports/PricingRepository'

export type { SessionBootstrap } from './useCases/session/bootstrapSession'
export { bootstrapSession } from './useCases/session/bootstrapSession'

export type { AddIngredientResult } from './useCases/meal/addIngredient'
export { addIngredient } from './useCases/meal/addIngredient'
export type { RemoveIngredientResult } from './useCases/meal/removeIngredient'
export { removeIngredient } from './useCases/meal/removeIngredient'
export type { UpdatePortionResult } from './useCases/meal/updatePortion'
export { updatePortion } from './useCases/meal/updatePortion'
export type { MealValidationResult } from './useCases/meal/validateMeal'
export { validateMealForSubmit } from './useCases/meal/validateMeal'

export { calculateMealPrice } from './useCases/pricing/calculateMealPrice'
export { DEFAULT_PRICING_RULES } from './useCases/pricing/defaultRules'

export { createOrderEntry } from './useCases/order/createOrderEntry'
export type { WhatsAppMessage } from './useCases/order/formatWhatsAppMessage'
export { formatWhatsAppMessage } from './useCases/order/formatWhatsAppMessage'
export type { DietKitOrder } from './useCases/order/formatDietKitMessage'
export { formatDietKitMessage } from './useCases/order/formatDietKitMessage'
