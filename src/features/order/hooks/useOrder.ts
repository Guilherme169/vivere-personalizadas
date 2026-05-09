import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { Customer, DraftMealEntry } from '@/domain/order'
import { orderTotal, isOrderEmpty } from '@/domain/order'
import { useSessionStore } from '@/features/session/store/sessionStore'
import { useOrderStore } from '../store/orderStore'
import type { OrderStep } from '../store/orderStore'

export const useOrder = () => {
  const sessionData = useSessionStore((s) => s.data)

  const {
    draft,
    step,
    whatsappMessage,
    addMeal,
    removeMeal,
    updateCustomer,
    setNotes,
    setStep,
    prepareWhatsApp,
    reset,
  } = useOrderStore(
    useShallow((s) => ({
      draft: s.draft,
      step: s.step,
      whatsappMessage: s.whatsappMessage,
      addMeal: s.addMeal,
      removeMeal: s.removeMeal,
      updateCustomer: s.updateCustomer,
      setNotes: s.setNotes,
      setStep: s.setStep,
      prepareWhatsApp: s.prepareWhatsApp,
      reset: s.reset,
    })),
  )

  const addCurrentMeal = useCallback(
    (entry: DraftMealEntry) => {
      if (!sessionData) return
      addMeal(entry, sessionData.businessPhone)
    },
    [addMeal, sessionData],
  )

  const handleUpdateCustomer = useCallback(
    (customer: Customer) => updateCustomer(customer),
    [updateCustomer],
  )

  const submitOrder = useCallback(() => {
    if (!whatsappMessage) return
    window.open(whatsappMessage.url, '_blank', 'noopener,noreferrer')
    setStep('submitted')
  }, [whatsappMessage, setStep])

  const goToStep = useCallback((s: OrderStep) => setStep(s), [setStep])

  return {
    draft,
    step,
    whatsappMessage,
    total: orderTotal(draft),
    isEmpty: isOrderEmpty(draft),
    addMeal: addCurrentMeal,
    removeMeal,
    updateCustomer: handleUpdateCustomer,
    setNotes,
    goToStep,
    prepareWhatsApp: () => sessionData && prepareWhatsApp(sessionData.businessPhone),
    submitOrder,
    reset,
  }
}
