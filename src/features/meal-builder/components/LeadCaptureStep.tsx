import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/features/shared/components/Logo'
import { AppFooter } from '@/features/shared/components/AppFooter'
import { useWizardStore } from '../store/wizardStore'
import { services } from '@/infrastructure/ServiceFactory'
import { normalizePhone } from '@/domain/customer'

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function LeadCaptureStep() {
  const { navigate, setCustomer, loadCatalog, loadFulfillmentZones } = useWizardStore()
  const nameRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [greeting, setGreeting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    nameRef.current?.focus()
    loadCatalog()
    loadFulfillmentZones()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const phoneDigits = phone.replace(/\D/g, '')
  const canContinue = name.trim().length >= 2 && phoneDigits.length >= 10 && consent && !loading

  async function handleContinue() {
    if (!canContinue) return
    setLoading(true)
    setError(null)
    try {
      const normalized = normalizePhone(phone)
      const existing = await services.customerRepo.findByPhone(normalized)

      if (existing) {
        setGreeting(`Olá de novo, ${existing.name}!`)
        await new Promise(r => setTimeout(r, 1000))
        const updated = await services.customerRepo.upsertByPhone({
          name,
          phone: normalized,
        })
        setCustomer(updated)
      } else {
        const created = await services.customerRepo.upsertByPhone({
          name,
          phone: normalized,
          consentLgpdAt: new Date().toISOString(),
          source: 'web',
        })
        setCustomer(created)
      }

      localStorage.setItem('vivere:customer_id', (existing?.id ?? '') as string)
      navigate('hero', 'forward')
    } catch (err) {
      console.error('Lead capture error:', err)
      setError('Erro ao salvar seus dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-creme flex flex-col">
      <section className="flex flex-col flex-1 items-center px-6 pt-16 pb-40 animate-fade-up">
        <Logo withSlogan size="xl" className="mb-10" />

        <p className="text-xs font-medium uppercase tracking-[0.08em] text-texto-suave mb-3">
          Vamos começar
        </p>

        <h1 className="font-display font-semibold text-[28px] leading-[1.15] text-verde-escuro mb-8 text-center">
          Antes de montar sua marmita,<br />me diga quem é você
        </h1>

        <div className="w-full max-w-sm space-y-4">
          <div>
            <label className="text-xs font-medium text-texto-suave uppercase tracking-wide block mb-1.5">
              Nome
            </label>
            <input
              ref={nameRef}
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleContinue()}
              className="w-full h-12 rounded-2xl bg-surface border border-borda px-4 text-[15px] placeholder:text-texto-suave focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-texto-suave uppercase tracking-wide block mb-1.5">
              WhatsApp
            </label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="(51) 99999-9999"
              value={phone}
              onChange={e => setPhone(maskPhone(e.target.value))}
              onKeyDown={e => e.key === 'Enter' && handleContinue()}
              className="w-full h-12 rounded-2xl bg-surface border border-borda px-4 text-[15px] placeholder:text-texto-suave focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-borda text-verde-escuro accent-verde-escuro shrink-0"
            />
            <span className="text-sm text-texto-suave leading-snug">
              Li e concordo com a{' '}
              <Link to="/privacidade" target="_blank" className="text-verde-escuro underline underline-offset-2">
                Política de Privacidade
              </Link>
            </span>
          </label>

          {greeting && (
            <div className="rounded-2xl bg-verde-vivo/10 border border-verde-vivo/30 px-4 py-3 text-sm font-medium text-verde-escuro text-center">
              {greeting}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </div>
      </section>

      <AppFooter />

      <div
        className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur border-t border-borda px-5 py-4 z-40"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <button
          disabled={!canContinue}
          onClick={handleContinue}
          className={[
            'w-full h-12 rounded-2xl font-medium text-[15px] transition-all',
            canContinue
              ? 'bg-laranja text-white shadow-cta hover:bg-laranja-hover active:scale-[0.98]'
              : 'bg-laranja/40 text-white cursor-not-allowed',
          ].join(' ')}
        >
          {loading ? 'Aguarde…' : 'Continuar'}
        </button>
      </div>
    </main>
  )
}
