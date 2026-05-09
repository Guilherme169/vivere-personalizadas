import { useAdminStore } from '../../store/adminStore'
import { calculateMealPrice, formatBRL } from '@/domain/pricing'
import type { CompositionItem } from '@/domain/cardapio'

const EXAMPLE_ITEMS: CompositionItem[] = [
  { ingredientId: 'chicken-breast-shredded', preparationId: 'shredded', grams: 150 },
  { ingredientId: 'white-rice', preparationId: 'cooked', grams: 100 },
  { ingredientId: 'broccoli', preparationId: 'steamed', grams: 100 },
]

export function PreviewTab() {
  const { data } = useAdminStore()
  const result = calculateMealPrice(EXAMPLE_ITEMS, data.ingredients, data.pricingConfig)

  function ingredientName(id: string) {
    return data.ingredients.find(i => i.id === id)?.name ?? id
  }

  return (
    <div className="space-y-5 pt-2">
      <p className="text-sm text-texto-suave">
        Composição exemplo: 150g frango filé desfiado + 100g arroz branco + 100g brócolis.
        Atualiza automaticamente ao salvar parâmetros.
      </p>

      <div className="rounded-2xl bg-surface border border-borda p-4 space-y-3">
        <p className="text-xs font-semibold text-verde-escuro uppercase tracking-wide">Quebra por ingrediente</p>
        {result.items.map(item => (
          <div key={item.ingredientId} className="flex justify-between text-sm">
            <span className="text-texto-suave">{ingredientName(item.ingredientId)} ({item.grams}g)</span>
            <span className="text-verde-escuro font-medium">{formatBRL(item.cost)}</span>
          </div>
        ))}
        <div className="border-t border-borda pt-2 flex justify-between text-sm">
          <span className="text-texto-suave">Total ingredientes</span>
          <span className="text-verde-escuro font-medium">{formatBRL(result.totalIngredientCost)}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-surface border border-borda p-4 space-y-3">
        <p className="text-xs font-semibold text-verde-escuro uppercase tracking-wide">Composição do preço</p>
        <div className="flex justify-between text-sm">
          <span className="text-texto-suave">Ingredientes</span>
          <span className="text-verde-escuro">{formatBRL(result.totalIngredientCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-texto-suave">Custos fixos / unidade</span>
          <span className="text-verde-escuro">{formatBRL(result.fixedCostPerUnit)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-texto-suave">Custo total</span>
          <span className="text-verde-escuro">{formatBRL(result.totalCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-texto-suave">Markup {data.pricingConfig.markupPercentage}%</span>
          <span className="text-verde-escuro">{formatBRL(result.suggestedPrice - result.totalCost)}</span>
        </div>
        <div className="border-t border-borda pt-2 flex justify-between">
          <span className="font-semibold text-verde-escuro">Preço final</span>
          <span className="font-display font-semibold text-[20px] text-laranja">
            R$ {Math.floor(result.finalPrice).toLocaleString('pt-BR')},99
          </span>
        </div>
      </div>
    </div>
  )
}
