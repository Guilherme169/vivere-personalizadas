import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Save, LogOut } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Logo } from '@/features/shared/components/Logo'
import { supabase } from '@/infrastructure/supabase/client'
import { useAdminStore } from '../store/adminStore'
import { CustosFixosTab } from './tabs/CustosFixosTab'
import { OperacionalTab } from './tabs/OperacionalTab'
import { RegrasClienteTab } from './tabs/RegrasClienteTab'
import { IngredientesTab } from './tabs/IngredientesTab'
import { PreviewTab } from './tabs/PreviewTab'
import { PedidosTab } from './tabs/PedidosTab'

export function AdminPanel() {
  const { dirty, persist, reload, loading } = useAdminStore()
  const [saving, setSaving] = useState(false)

  useEffect(() => { reload() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    setSaving(true)
    try {
      await persist()
    } catch {
      // error already logged in store
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-dvh bg-creme">
      <header className="sticky top-0 z-10 bg-creme/90 backdrop-blur-sm border-b border-borda px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="h-9 w-9 rounded-xl bg-surface border border-borda flex items-center justify-center text-verde-escuro hover:bg-verde-escuro/5 transition-colors">
            <ChevronLeft size={20} strokeWidth={2} />
          </Link>
          <Logo variant="verde" size="sm" />
          <span className="text-sm font-medium text-texto-suave">Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!dirty || saving || loading}
            className={[
              'flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium transition-all active:scale-[0.98]',
              dirty && !saving
                ? 'bg-laranja text-white shadow-cta hover:bg-laranja-hover'
                : 'bg-surface border border-borda text-texto-suave opacity-50 cursor-not-allowed',
            ].join(' ')}
          >
            <Save size={15} />
            {saving ? 'Salvando…' : dirty ? 'Salvar' : 'Salvo'}
          </button>

          <button
            onClick={handleSignOut}
            className="h-9 w-9 rounded-xl bg-surface border border-borda flex items-center justify-center text-texto-suave hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-7 w-7 rounded-full border-2 border-verde-escuro/30 border-t-verde-escuro animate-spin" />
        </div>
      )}

      <div className="px-4 py-5">
        <Tabs defaultValue="custos" className="w-full">
          <TabsList className="flex w-full overflow-x-auto no-scrollbar bg-surface border border-borda rounded-2xl p-1 gap-1 mb-6">
            {[
              { value: 'custos', label: 'Custos' },
              { value: 'operacional', label: 'Operacional' },
              { value: 'regras', label: 'Regras' },
              { value: 'ingredientes', label: 'Ingredientes' },
              { value: 'preview', label: 'Prévia' },
              { value: 'pedidos', label: 'Pedidos' },
            ].map(t => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex-1 min-w-[70px] text-xs font-medium rounded-xl py-2 data-[state=active]:bg-verde-escuro data-[state=active]:text-white data-[state=inactive]:text-texto-suave transition-colors"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="custos"><CustosFixosTab /></TabsContent>
          <TabsContent value="operacional"><OperacionalTab /></TabsContent>
          <TabsContent value="regras"><RegrasClienteTab /></TabsContent>
          <TabsContent value="ingredientes"><IngredientesTab /></TabsContent>
          <TabsContent value="preview"><PreviewTab /></TabsContent>
          <TabsContent value="pedidos"><PedidosTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
