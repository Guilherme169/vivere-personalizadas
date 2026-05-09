# DISCOVERY.md — Domínio e Regras de Negócio

## 1. Glossário do Domínio

| Termo | Definição no Contexto da Vivere |
|---|---|
| **Marmita** | Refeição completa embalada para consumo individual |
| **Pedido** | Conjunto de uma ou mais marmitas de um mesmo cliente em uma transação |
| **Cardápio** | Lista de ingredientes disponíveis em um período (diário ou semanal) |
| **Ingrediente** | Item individual que compõe uma marmita (ex: frango grelhado, arroz integral) |
| **Categoria** | Classificação funcional do ingrediente (Proteína, Carboidrato, Legume, etc.) |
| **Gramatura** | Peso em gramas de uma porção de ingrediente dentro da marmita |
| **Porção** | Quantidade-padrão de um ingrediente (1 porção = gramatura padrão da categoria) |
| **Tamanho (Container)** | Classificação da marmita por capacidade total de gramatura (P/M/G/GG) |
| **Regra de Composição** | Quais categorias são obrigatórias/opcionais e em que quantidade |
| **Regra de Gramatura** | Limite mínimo/máximo de gramatura por categoria em cada tamanho |
| **Preço Base** | Valor mínimo da marmita que cobre a composição padrão para o tamanho |
| **Surcharge** | Acréscimo de preço por ingrediente premium ou porção extra |
| **Breakdown de Preço** | Detalhamento de cada componente do preço final |
| **Ingrediente Premium** | Ingrediente com custo superior ao padrão da categoria (ex: salmão, picanha) |
| **Ticket de Produção** | Resumo estruturado enviado para a cozinha com todos os detalhes do pedido |

---

## 2. Modelo de Domínio

### 2.1 Entidades (têm identidade e ciclo de vida)

#### `Ingredient`
Representa um item disponível no cardápio.
```
Ingredient {
  id: string (UUID)
  name: string
  category: IngredientCategory
  unitGramatura: number          // gramas por 1 porção padrão
  basePrice: Money               // R$0 se incluso no preço base; > 0 se adicional
  isPremium: boolean
  premiumSurcharge: Money        // cobrança extra se isPremium = true
  isAvailable: boolean           // pode ser desativado sem deletar
  allergens: string[]            // 'gluten', 'lactose', 'nuts', etc.
  tags: string[]                 // 'vegan', 'sem-gluten', 'low-carb', etc.
}
```

#### `Meal` (Aggregate Root)
Representa uma marmita sendo montada. Contém a composição e valida as regras internamente.
```
Meal {
  id: string (UUID)
  containerSize: ContainerSize
  items: MealItem[]              // ingredientes selecionados com quantidade
  notes: string                  // observações livres (sem sal, sem pimenta, etc.)
  isValid: boolean               // atualizado automaticamente ao mudar items
  validationErrors: ValidationError[]
}

MealItem {
  ingredient: Ingredient
  portionCount: number           // 1 = porção padrão; 2 = dobro; 0.5 = metade
  gramatura: number              // portionCount × ingredient.unitGramatura
}
```

#### `Order`
Representa um pedido completo pronto para envio.
```
Order {
  id: string (UUID)
  customer: Customer
  meals: OrderMeal[]             // cada item: meal + seu breakdown de preço
  totalPrice: Money
  deliveryNotes: string
  createdAt: Date
  status: OrderStatus
}

OrderMeal {
  meal: Meal
  priceBreakdown: PriceBreakdown
  subtotal: Money
}
```

---

### 2.2 Value Objects (imutáveis, sem identidade própria)

#### `ContainerSize`
```typescript
enum ContainerSize {
  SMALL = 'P',          // 500g total
  MEDIUM = 'M',         // 700g total
  LARGE = 'G',          // 900g total
  EXTRA_LARGE = 'GG',   // 1100g total
}
```

#### `IngredientCategory`
```typescript
enum IngredientCategory {
  PROTEIN = 'protein',
  CARB = 'carb',
  LEGUME = 'legume',         // feijão, lentilha
  VEGETABLE = 'vegetable',   // legumes e verduras cozidos
  SALAD = 'salad',           // folhas e frios (não contam no peso total)
  SAUCE = 'sauce',           // molhos (não contam no peso total)
  EXTRA = 'extra',           // adicionais cobrados à parte
}
```

#### `Money`
```typescript
// Sempre armazenado em centavos para evitar floating-point
Money { amountInCents: number, currency: 'BRL' }
```

#### `Gramatura`
```typescript
Gramatura { value: number, unit: 'g' }
```

---

### 2.3 Regras de Composição

#### Ingredientes Obrigatórios (por marmita)
| Categoria | Obrigatório? | Quantidade mínima | Quantidade máxima |
|---|---|---|---|
| Proteína | Sim | 1 porção | 2 porções (2ª cobrada) |
| Carboidrato | Sim | 1 porção | 1 porção (troca = ok) |
| Legume/Verdura | Sim | 1 tipo | ilimitado (completam o peso) |
| Feijão/Leguminosa | Não | — | 1 porção (gramatura fixa) |
| Salada | Não | — | ilimitado (fora do peso) |
| Molho | Não | — | 2 tipos máx (fora do peso) |
| Extra | Não | — | conforme cardápio |

**Invariantes da composição:**
- Uma marmita sem proteína é **inválida**
- Uma marmita sem carboidrato é **inválida**
- Uma marmita sem legume/verdura é **inválida**
- A soma das gramaturas (excluindo salada e molho) não pode exceder o limite do `ContainerSize`
- A soma das gramaturas não pode ser inferior a 80% do limite do `ContainerSize` (marmita "vazia")

---

### 2.4 Regras de Gramatura

#### Gramaturas Padrão por Categoria e Tamanho
*(Valores a confirmar com a Vivere — estes são defaults razoáveis)*

| Categoria | P (500g) | M (700g) | G (900g) | GG (1100g) |
|---|---|---|---|---|
| Proteína (1 porção) | 120g | 150g | 180g | 220g |
| Carboidrato (1 porção) | 150g | 180g | 220g | 260g |
| Feijão (fixo se incluso) | 60g | 60g | 80g | 80g |
| Legumes (completam) | ~170g | ~310g | ~420g | ~540g |

*"Completam" = gramatura total do container − proteína − carboidrato − feijão (se incluso)*

#### Comportamento de Gramaturas Acima do Padrão
- Proteína 2ª porção: cobra o `basePrice` do ingrediente adicionalmente (não é free)
- Legumes adicionais: gratuitos, completam o espaço restante
- Carboidrato não tem opção de dobrar no MVP (troca de tipo é ok)

---

## 3. Regras de Negócio (Business Rules)

### 3.1 Regras de Validação (invariantes que nunca podem ser violadas)

**BR-001:** Toda marmita deve conter exatamente 1 proteína principal (pode ser premium).

**BR-002:** Toda marmita deve conter exatamente 1 carboidrato.

**BR-003:** Toda marmita deve conter pelo menos 1 legume ou verdura.

**BR-004:** A gramatura total (excluindo salada e molhos) não pode exceder o limite do tamanho escolhido.

**BR-005:** Ingredientes marcados como `isAvailable: false` não podem ser adicionados.

**BR-006:** Proteína extra (2ª porção) gera cobrança adicional automaticamente.

---

### 3.2 Regras de Precificação

**PR-001 — Preço Base por Tamanho:**
Cada tamanho tem um preço base que cobre a composição padrão (1 proteína não-premium + carboidrato + legumes livres).

**PR-002 — Surcharge de Ingrediente Premium:**
Ingredientes marcados como `isPremium = true` têm `premiumSurcharge` somado ao preço final. O surcharge é fixo por ingrediente, independente do tamanho.

**PR-003 — Proteína Extra:**
Adicionar uma 2ª porção de proteína cobre o valor `basePrice` do ingrediente.
*(Exemplo: frango extra = R$8. Salmão extra = R$12 + surcharge premium)*

**PR-004 — Adicionais:**
Ingredientes da categoria `EXTRA` têm `basePrice > 0` sempre. São somados linearmente.

**PR-005 — Molhos e Saladas são gratuitos** (não impactam preço).

**PR-006 — Feijão é gratuito** se incluso (está dentro do preço base).

---

### 3.3 Regras de Operação

**OP-001:** O ticket de produção deve conter, em ordem: nome do cliente, tamanho, proteína, carboidrato, feijão (S/N), legumes (lista), salada (lista), molhos (lista), adicionais, observações, preço total.

**OP-002:** A mensagem WhatsApp deve ser legível sem o app — o operador deve conseguir executar o pedido lendo apenas o texto.

**OP-003:** Observações livres (campo de texto) NÃO afetam o preço. São apenas instruções de preparo.

---

## 4. Fluxos de Negócio

### 4.1 Fluxo Principal: Montar Pedido

```
1. Cliente seleciona tamanho do container (P/M/G/GG)
   → Sistema exibe preço base e gramatura disponível

2. Cliente seleciona proteína
   → Sistema valida disponibilidade
   → Sistema aplica surcharge se premium
   → Sistema deduz gramatura da proteína do total disponível

3. Cliente seleciona carboidrato
   → Sistema deduz gramatura do total disponível

4. Cliente seleciona legumes (opcional: feijão)
   → Sistema calcula gramatura restante preenchida por legumes

5. Cliente seleciona opcionais (salada, molho, extras)
   → Salada/molho: sem impacto em gramatura ou preço
   → Extras: somados ao preço

6. Cliente revisa composição e breakdown de preço

7. Cliente adiciona nome, telefone e observações

8. Cliente confirma → Sistema gera mensagem formatada

9. Cliente toca no botão WhatsApp → Abre WhatsApp com mensagem pré-preenchida
```

### 4.2 Fluxo de Validação em Tempo Real
A cada mudança na composição da marmita:
1. `MealCompositionRules.validate(meal)` → retorna lista de `ValidationError`
2. `PricingEngine.calculate(meal)` → retorna `PriceBreakdown` atualizado
3. Store React é atualizado → UI reflete mudanças

---

## 5. Premissas e Incógnitas (a validar com a Vivere)

| # | Premissa / Pergunta | Impacto se errado |
|---|---|---|
| P-01 | Cardápio muda diariamente | Precisamos de admin de cardápio antes do V2 |
| P-02 | Cliente pode montar múltiplas marmitas em 1 pedido | Complexidade do Order model |
| P-03 | Gramatura dos tamanhos conforme tabela acima | Ajuste nos defaults do PricingEngine |
| P-04 | Preços base: P=R$22, M=R$28, G=R$34, GG=R$40 | Ajuste na config de pricing |
| P-05 | Surcharge de premium varia por ingrediente (não é fixo único) | PremiumIngredientRule por ingrediente, não global |
| P-06 | Tem opção vegetariana/vegana como proteína | Sem impacto arquitetural (é só tag no ingrediente) |
| P-07 | Pagamento não é escopo do MVP | Confirmar: nem para V2? |
| P-08 | WhatsApp é o único canal de envio no MVP | Confirmar número de destino (cliente manda para si mesmo ou para a Vivere?) |

---

## 6. Edge Cases Identificados

| Caso | Comportamento Esperado |
|---|---|
| Cliente tenta adicionar proteína duplicada | Bloquear; oferecer "porção extra" como opção |
| Legumes completam exatamente o limite | Aceitar; mostrar barra de gramatura 100% |
| Legumes ultrapassariam o limite | Bloquear adição; indicar gramatura restante = 0 |
| Nenhum legume no cardápio do dia disponível | Marmita inválida; exibir aviso prominente |
| Cliente troca proteína depois de ter adicionado extras | Recalcular preço; manter extras se ainda válidos |
| Marmita parcial (sem carboidrato) no checkout | Bloquear envio; destacar erro de validação |
