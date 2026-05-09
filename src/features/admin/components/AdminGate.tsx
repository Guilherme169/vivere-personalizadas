import { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'
import { Logo } from '@/features/shared/components/Logo'
import { supabase } from '@/infrastructure/supabase/client'
import { AdminPanel } from './AdminPanel'

export function AdminGate() {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session)
      setChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) setError(authError.message)
    setLoading(false)
  }

  if (checking) {
    return (
      <div className="min-h-dvh bg-creme flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-verde-escuro/30 border-t-verde-escuro animate-spin" />
      </div>
    )
  }

  if (authenticated) return <AdminPanel />

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
        <p className="text-sm text-texto-suave text-center mb-6">Entre com seu e-mail e senha</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            autoComplete="email"
            placeholder="E-mail"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            className="w-full h-12 rounded-2xl bg-creme border border-borda px-4 text-[15px] placeholder:text-texto-suave focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
          />
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Senha"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            className={[
              'w-full h-12 rounded-2xl bg-creme border px-4 text-[15px] placeholder:text-texto-suave',
              'focus:outline-none focus:ring-2 focus:ring-verde-escuro/30',
              error ? 'border-red-400' : 'border-borda',
            ].join(' ')}
          />
          {error && <p className="text-xs text-aviso">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-verde-escuro text-white font-medium text-[15px] hover:bg-verde-escuro-hover active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
