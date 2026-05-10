import { useEffect, useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import type { FulfillmentZone } from '@/domain/fulfillment'
import { services } from '@/infrastructure/ServiceFactory'
import { formatBRL } from '@/domain/pricing'

export function ZonasTab() {
  const [zones, setZones] = useState<FulfillmentZone[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<FulfillmentZone>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const all = await services.zoneRepo.listActive()
      setZones(all)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar zonas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(zone: FulfillmentZone) {
    setEditingId(zone.id)
    setEditDraft({ ...zone })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDraft({})
  }

  async function saveEdit(zone: FulfillmentZone) {
    setSaving(true)
    setError(null)
    try {
      await services.zoneRepo.update(zone.id, editDraft)
      await load()
      setEditingId(null)
      setEditDraft({})
    } catch (err) {
      console.error(err)
      setError('Erro ao salvar zona.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(zone: FulfillmentZone) {
    try {
      await services.zoneRepo.update(zone.id, { active: !zone.active })
      await load()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-7 w-7 rounded-full border-2 border-verde-escuro/30 border-t-verde-escuro animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-texto-suave">
        Cidades de entrega cadastradas. Para adicionar novas cidades, use o SQL Editor do Supabase.
      </p>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {zones.map(zone => {
        const isEditing = editingId === zone.id
        return (
          <div key={zone.id} className="bg-surface rounded-3xl p-5 border border-borda shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                {isEditing ? (
                  <input
                    className="font-medium text-verde-escuro border-b border-verde-escuro/30 bg-transparent focus:outline-none text-[16px] w-full"
                    value={editDraft.cityName ?? ''}
                    onChange={e => setEditDraft(d => ({ ...d, cityName: e.target.value }))}
                  />
                ) : (
                  <p className="font-medium text-verde-escuro">{zone.cityName}</p>
                )}
                <p className="text-xs text-texto-suave mt-0.5">slug: {zone.citySlug}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => saveEdit(zone)}
                      disabled={saving}
                      className="h-8 w-8 rounded-xl bg-verde-escuro text-white flex items-center justify-center hover:bg-verde-escuro/80 transition-colors"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="h-8 w-8 rounded-xl border border-borda text-texto-suave flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(zone)}
                      className="h-8 w-8 rounded-xl border border-borda text-texto-suave flex items-center justify-center hover:bg-verde-escuro/5 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => toggleActive(zone)}
                      className={[
                        'h-8 px-3 rounded-xl text-xs font-medium transition-colors',
                        zone.active
                          ? 'bg-verde-vivo/15 text-verde-escuro hover:bg-red-50 hover:text-red-500'
                          : 'bg-red-50 text-red-500 hover:bg-verde-vivo/15 hover:text-verde-escuro',
                      ].join(' ')}
                    >
                      {zone.active ? 'Ativa' : 'Inativa'}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Mínimo de unidades">
                {isEditing ? (
                  <input
                    type="number"
                    className="w-full h-9 rounded-xl bg-creme border border-borda px-3 text-sm focus:outline-none focus:ring-1 focus:ring-verde-escuro/30"
                    value={editDraft.minUnits ?? zone.minUnits}
                    onChange={e => setEditDraft(d => ({ ...d, minUnits: Number(e.target.value) }))}
                  />
                ) : (
                  <span>{zone.minUnits} unidades</span>
                )}
              </Field>

              <Field label="Frete">
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-9 rounded-xl bg-creme border border-borda px-3 text-sm focus:outline-none focus:ring-1 focus:ring-verde-escuro/30"
                    value={editDraft.deliveryFeeBRL ?? zone.deliveryFeeBRL}
                    onChange={e => setEditDraft(d => ({ ...d, deliveryFeeBRL: Number(e.target.value) }))}
                  />
                ) : (
                  <span>{zone.deliveryFeeBRL === 0 ? 'A combinar' : formatBRL(zone.deliveryFeeBRL)}</span>
                )}
              </Field>

              <Field label="Dias de entrega">
                <span>{zone.deliveryDays.length > 0 ? zone.deliveryDays.join(', ') : '—'}</span>
              </Field>

              <Field label="Período">
                <span>{zone.deliveryPeriod ?? '—'}</span>
              </Field>

              <Field label="Agendamento">
                {isEditing ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editDraft.requiresScheduling ?? zone.requiresScheduling}
                      onChange={e => setEditDraft(d => ({ ...d, requiresScheduling: e.target.checked }))}
                      className="accent-verde-escuro"
                    />
                    <span>Exige agendamento</span>
                  </label>
                ) : (
                  <span>{zone.requiresScheduling ? 'Sim' : 'Não'}</span>
                )}
              </Field>
            </div>

            {(zone.deliveryFeeNote ?? isEditing) && (
              <div>
                <p className="text-xs font-medium text-texto-suave uppercase tracking-wide mb-1">Nota de entrega</p>
                {isEditing ? (
                  <textarea
                    rows={2}
                    className="w-full rounded-xl bg-creme border border-borda px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-verde-escuro/30 resize-none"
                    value={editDraft.deliveryFeeNote ?? zone.deliveryFeeNote ?? ''}
                    onChange={e => setEditDraft(d => ({ ...d, deliveryFeeNote: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm text-texto-suave">{zone.deliveryFeeNote}</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-texto-suave uppercase tracking-wide mb-1">{label}</p>
      <div className="text-verde-escuro">{children}</div>
    </div>
  )
}
