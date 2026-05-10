import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Download, Upload } from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { IngredienteDialog } from '../IngredienteDialog'
import type { Ingredient } from '@/domain/catalog'
import { CATEGORY_LABEL } from '@/domain/catalog'
import { DIET_FLAG_LABEL } from '@/domain/meal'

export function IngredientesTab() {
  const { data, update, role } = useAdminStore()
  const canWrite = role !== 'atendente'
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Ingredient | undefined>(undefined)
  const fileRef = useRef<HTMLInputElement>(null)

  function openNew() {
    setEditing(undefined)
    setDialogOpen(true)
  }

  function openEdit(ing: Ingredient) {
    setEditing(ing)
    setDialogOpen(true)
  }

  function handleSave(ing: Ingredient) {
    const existing = data.ingredients.find(i => i.id === ing.id)
    const updated = existing
      ? data.ingredients.map(i => i.id === ing.id ? ing : i)
      : [...data.ingredients, ing]
    update({ ingredients: updated })
    setDialogOpen(false)
  }

  function handleDelete(id: string) {
    if (!confirm('Remover ingrediente?')) return
    update({ ingredients: data.ingredients.filter(i => i.id !== id) })
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vivere-catalog-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm('Substituir o catálogo inteiro pelo arquivo importado?')) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (parsed.ingredients) update(parsed)
      } catch {
        alert('Arquivo inválido.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex gap-2">
        <button
          onClick={openNew}
          disabled={!canWrite}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-verde-escuro text-white text-sm font-medium hover:bg-verde-escuro-hover active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={15} /> Adicionar
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-borda text-verde-escuro text-sm font-medium hover:bg-verde-escuro/5 transition-colors"
        >
          <Download size={15} /> Exportar JSON
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={!canWrite}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-borda text-texto-suave text-sm font-medium hover:bg-verde-escuro/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Upload size={15} /> Importar
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>

      <div className="space-y-2">
        {data.ingredients.map(ing => (
          <div key={ing.id} className="bg-surface rounded-2xl border border-borda p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-verde-escuro truncate">{ing.name}</span>
                <span className="text-[10px] bg-verde-escuro/8 text-verde-escuro px-2 py-0.5 rounded-full shrink-0">
                  {CATEGORY_LABEL[ing.category]}
                </span>
              </div>
              <div className="text-xs text-texto-suave mt-0.5">
                R$ {ing.pricePerKg.toFixed(2)}/kg · rend. {ing.baseYield} · {ing.preparations.length} preparo(s)
              </div>
              {ing.dietFlags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {ing.dietFlags.map(f => (
                    <span key={f} className="text-[10px] bg-verde-vivo/10 text-verde-escuro px-1.5 py-0.5 rounded-full">
                      {DIET_FLAG_LABEL[f]}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => openEdit(ing)}
                disabled={!canWrite}
                className="h-8 w-8 rounded-xl bg-verde-escuro/8 flex items-center justify-center text-verde-escuro hover:bg-verde-escuro/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDelete(ing.id)}
                disabled={!canWrite}
                className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <IngredienteDialog
        open={dialogOpen}
        initial={editing}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  )
}
