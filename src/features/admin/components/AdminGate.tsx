import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Logo } from '@/features/shared/components/Logo'
import { ENV } from '@/infrastructure/config'
import { AdminPanel } from './AdminPanel'

export function AdminGate() {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === ENV.adminPassword) {
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  if (unlocked) return <AdminPanel />

  return (
    <div className="min-h-dvh bg-creme flex flex-col items-center justify-center px-6">
      <Logo variant="verde" size="md" className="mb-10" />

      <div className="w-full max-w-xs bg-surface rounded-3xl border border-borda shadow-card p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-verde-escuro/8 flex items-center justify-center">
            <Lock size={22} className="text-verde-escuro" strokeWidth={1.75} />
          </div>
        </div>

        <h1 className="font-display font-semibold text-[22px] text-verde-escuro text-center mb-1">
          Painel Admin
        </h1>
        <p className="text-sm text-texto-suave text-center mb-6">Digite a senha para continuar</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Senha"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            className={[
              'w-full h-12 rounded-2xl bg-creme border px-4 text-[15px] placeholder:text-texto-suave',
              'focus:outline-none focus:ring-2 focus:ring-verde-escuro/30',
              error ? 'border-red-400' : 'border-borda',
            ].join(' ')}
          />
          {error && <p className="text-xs text-aviso">Senha incorreta.</p>}
          <button
            type="submit"
            className="w-full h-12 rounded-2xl bg-verde-escuro text-white font-medium text-[15px] hover:bg-verde-escuro-hover active:scale-[0.98] transition-all"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
