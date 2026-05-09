import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Ingredient, Preparation, Category, DietFlag } from '@/domain/catalog'
import { CATEGORY_LABEL } from '@/domain/catalog'

const ALL_CATEGORIES: Category[] = ['protein', 'carb', 'vegetable', 'seasoning', 'dairy', 'other']
const ALL_FLAGS: { value: DietFlag; label: string }[] = [
  { value: 'sem-gluten', label: 'Sem glúten' },
  { value: 'sem-lactose', label: 'Sem lactose' },
  { value: 'vegano', label: 'Vegano' },
  { value: 'vegetariano', label: 'Vegetariano' },
]

type FormPrep = { id: string; name: string; yieldFactor: string }

interface Props {
  open: boolean
  initial?: Ingredient
  onSave: (ing: Ingredient) => void
  onClose: () => void
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function IngredienteDialog({ open, initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<Category>(initial?.category ?? 'protein')
  const [pricePerKg, setPricePerKg] = useState(String(initial?.pricePerKg ?? ''))
  const [baseYield, setBaseYield] = useState(String(initial?.baseYield ?? '0.9'))
  const [preps, setPreps] = useState<FormPrep[]>(
    initial?.preparations.map(p => ({ id: p.id, name: p.name, yieldFactor: String(p.yieldFactor) })) ?? [
      { id: '', name: '', yieldFactor: '1' },
    ]
  )
  const [dietFlags, setDietFlags] = useState<DietFlag[]>(initial?.dietFlags ?? [])

  function toggleFlag(f: DietFlag) {
    setDietFlags(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  function setPrep(idx: number, field: keyof FormPrep, value: string) {
    setPreps(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }

  function addPrep() {
    setPreps(prev => [...prev, { id: '', name: '', yieldFactor: '1' }])
  }

  function removePrep(idx: number) {
    setPreps(prev => prev.filter((_, i) => i !== idx))
  }

  function handleSave() {
    const trimmedName = name.trim()
    if (!trimmedName) return
    const parsedPrice = parseFloat(pricePerKg)
    const parsedYield = parseFloat(baseYield)
    if (isNaN(parsedPrice) || isNaN(parsedYield)) return
    const parsedPreps: Preparation[] = preps
      .filter(p => p.name.trim())
      .map(p => ({
        id: p.id || slugify(p.name),
        name: p.name.trim(),
        yieldFactor: parseFloat(p.yieldFactor) || 1,
      }))
    if (parsedPreps.length === 0) return

    onSave({
      id: initial?.id ?? slugify(trimmedName),
      name: trimmedName,
      category,
      pricePerKg: parsedPrice,
      baseYield: parsedYield,
      preparations: parsedPreps,
      dietFlags,
    })
  }

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-[18px] text-verde-escuro">
            {initial ? 'Editar ingrediente' : 'Novo ingrediente'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-verde-escuro">Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-11 rounded-2xl bg-creme border border-borda px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-verde-escuro">Categoria</label>
            <Select value={category} onValueChange={v => setCategory(v as Category)}>
              <SelectTrigger className="h-11 rounded-2xl bg-creme border-borda">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-verde-escuro">Preço / kg (R$)</label>
              <input
                type="number" min={0} step={0.5}
                value={pricePerKg}
                onChange={e => setPricePerKg(e.target.value)}
                className="w-full h-11 rounded-2xl bg-creme border border-borda px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-verde-escuro">Rendimento base</label>
              <input
                type="number" min={0.1} max={1.5} step={0.05}
                value={baseYield}
                onChange={e => setBaseYield(e.target.value)}
                className="w-full h-11 rounded-2xl bg-creme border border-borda px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-verde-escuro">Formas de preparo</label>
              <button onClick={addPrep} className="flex items-center gap-1 text-xs text-verde-vivo font-medium">
                <Plus size={14} /> Adicionar
              </button>
            </div>
            {preps.map((p, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  placeholder="Nome (ex: Grelhado)"
                  value={p.name}
                  onChange={e => setPrep(idx, 'name', e.target.value)}
                  className="flex-1 h-10 rounded-xl bg-creme border border-borda px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
                />
                <input
                  type="number" min={0.1} max={2} step={0.05}
                  placeholder="Fator"
                  value={p.yieldFactor}
                  onChange={e => setPrep(idx, 'yieldFactor', e.target.value)}
                  className="w-20 h-10 rounded-xl bg-creme border border-borda px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-verde-escuro/30"
                />
                {preps.length > 1 && (
                  <button onClick={() => removePrep(idx)} className="text-aviso">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-verde-escuro">Restrições alimentares</label>
            <div className="flex flex-wrap gap-2">
              {ALL_FLAGS.map(f => (
                <button
                  key={f.value}
                  onClick={() => toggleFlag(f.value)}
                  className={[
                    'h-8 px-3 rounded-full text-xs font-medium border transition-colors',
                    dietFlags.includes(f.value)
                      ? 'bg-verde-vivo/15 border-verde-vivo text-verde-escuro'
                      : 'bg-transparent border-borda text-texto-suave',
                  ].join(' ')}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-2xl border border-borda text-texto-suave text-sm font-medium hover:bg-creme transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-11 rounded-2xl bg-verde-escuro text-white text-sm font-medium hover:bg-verde-escuro-hover active:scale-[0.98] transition-all"
          >
            Salvar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
