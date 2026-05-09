# ARCHITECTURE.md — Arquitetura Técnica

## 1. Princípios Fundamentais

### 1.1 Dependency Rule (Clean Architecture)
Dependências sempre apontam para dentro — do framework para o domínio, nunca o contrário.

```
React / Vite / shadcn         ← camada mais externa
    ↓ depende de
Application (use cases)
    ↓ depende de
Domain (entities, rules)      ← camada mais interna
    ↑ NUNCA depende de nada acima
```

**Consequência prática:** código em `/domain` não tem nenhum import de React, Zustand, localStorage, fetch ou biblioteca externa. É TypeScript puro. Pode ser testado com Node.js, executado em qualquer ambiente.

### 1.2 Feature-Based Modularity
Cada feature (`meal-builder`, `order-summary`) é um módulo coeso. Features não importam de outras features. Comunicação entre features passa pela camada de domínio ou por stores globais explícitos.

### 1.3 Configuração sobre Hardcode
Cardápio, preços e regras de gramatura são dados de configuração, não constantes no código. Hoje é um arquivo JSON/TypeScript. Amanhã é uma API. O código não sabe a diferença.

### 1.4 Extensibilidade via Composição
Regras de precificação são objetos que implementam a mesma interface `PricingRule`. Adicionar uma nova regra = criar um novo arquivo + registrar na chain. Zero modificação nas regras existentes.

---

## 2. Estrutura de Pastas

```
src/
├── domain/                          # Núcleo do negócio — zero deps externas
│   ├── meal/
│   │   ├── entities/
│   │   │   ├── Meal.ts              # Aggregate root — composição e validação
│   │   │   └── Ingredient.ts        # Ingrediente com propriedades de negócio
│   │   ├── value-objects/
│   │   │   ├── ContainerSize.ts     # Enum P/M/G/GG com capacidade em gramas
│   │   │   ├── IngredientCategory.ts
│   │   │   └── Gramatura.ts
│   │   └── rules/
│   │       ├── MealCompositionRules.ts  # Valida composição obrigatória
│   │       └── GramaturaRules.ts        # Limites por categoria/tamanho
│   ├── pricing/
│   │   ├── value-objects/
│   │   │   ├── Money.ts             # Valor em centavos + currency
│   │   │   └── PriceBreakdown.ts    # Preço base + adjustments + total
│   │   └── rules/
│   │       ├── PricingRule.ts       # Interface base para todas as regras
│   │       ├── BasePricingRule.ts   # Preço pelo tamanho do container
│   │       ├── PremiumIngredientRule.ts
│   │       ├── ExtraPortionRule.ts
│   │       └── PricingEngine.ts     # Orquestra chain de regras
│   └── order/
│       ├── entities/
│       │   └── Order.ts             # Aggregate de pedido completo
│       └── value-objects/
│           └── OrderStatus.ts
│
├── application/                     # Casos de uso — orquestra domínio
│   ├── meal-builder/
│   │   ├── BuildMealUseCase.ts      # Adicionar/remover ingrediente
│   │   └── ValidateMealUseCase.ts   # Retorna lista de erros de validação
│   ├── pricing/
│   │   └── CalculatePriceUseCase.ts # Recebe Meal, retorna PriceBreakdown
│   └── order/
│       ├── CreateOrderUseCase.ts    # Monta Order a partir de Meals
│       └── FormatWhatsAppUseCase.ts # Meal[] + Customer → string formatada
│
├── infrastructure/                  # Detalhes externos — substituíveis
│   ├── config/
│   │   └── menu.config.ts           # Cardápio estático (→ futuro: MenuRepository)
│   ├── pricing-config/
│   │   └── pricing.config.ts        # Preços base e regras (→ futuro: API)
│   ├── storage/
│   │   └── LocalOrderStorage.ts     # localStorage (→ futuro: API client)
│   └── whatsapp/
│       └── WhatsAppFormatter.ts     # Order → link wa.me com mensagem
│
├── features/                        # Módulos React
│   ├── meal-builder/
│   │   ├── components/              # UI da montagem da marmita
│   │   ├── hooks/
│   │   │   └── useMealBuilder.ts    # Bridge: UI ↔ Application use cases
│   │   └── store/
│   │       └── mealBuilderStore.ts  # Estado Zustand local da feature
│   ├── order-summary/
│   │   ├── components/
│   │   └── hooks/
│   │       └── useOrderSummary.ts
│   └── menu-admin/                  # Futuro: painel de gestão de cardápio
│
├── shared/
│   ├── components/ui/               # shadcn components (não modificar diretamente)
│   ├── hooks/                       # hooks genéricos cross-feature
│   └── lib/
│       └── utils.ts                 # cn(), formatMoney(), etc.
│
└── app/
    ├── App.tsx
    └── providers/
        └── AppProviders.tsx         # Zustand, theme, future: TenantContext
```

---

## 3. Camadas em Detalhe

### 3.1 Domain Layer

**Responsabilidade:** Expressar o negócio em código. Nada mais.

**Regras:**
- Nenhum `import` de React, Zustand, localStorage, fetch, ou qualquer biblioteca
- Apenas TypeScript, `uuid` (se necessário), e outros modules do domínio
- Entidades encapsulam invariantes: `Meal` nunca fica em estado inválido silenciosamente
- Value Objects são imutáveis: `Money.add()` retorna um novo `Money`, não muta

**Exemplo de entidade com invariante:**
```typescript
// domain/meal/entities/Meal.ts
export class Meal {
  private _items: MealItem[] = []

  addIngredient(ingredient: Ingredient, portionCount = 1): Result<void, ValidationError> {
    const newItems = [...this._items, { ingredient, portionCount }]
    const validation = MealCompositionRules.validate(newItems, this.containerSize)

    if (validation.hasGramaturaOverflow) {
      return Err(new ValidationError('GRAMATURA_OVERFLOW', ...))
    }

    if (this.hasCategory(ingredient.category)) {
      return Err(new ValidationError('DUPLICATE_CATEGORY', ...))
    }

    this._items = newItems
    return Ok(undefined)
  }

  get isValid(): boolean {
    return MealCompositionRules.validate(this._items, this.containerSize).isValid
  }
}
```

---

### 3.2 Application Layer

**Responsabilidade:** Orquestrar casos de uso. Não contém lógica de negócio — delega para o domínio. Não contém lógica de exibição — delega para a feature.

**Regras:**
- Funções puras que recebem input e retornam output
- Podem injetar repositórios/formatters via interface (não implementação concreta)
- Retornam tipos de domínio, não strings ou objetos ad-hoc

**Exemplo:**
```typescript
// application/pricing/CalculatePriceUseCase.ts
export function calculatePrice(meal: Meal, config: PricingConfig): PriceBreakdown {
  return PricingEngine.calculate(meal, config)
}
```

---

### 3.3 Infrastructure Layer

**Responsabilidade:** Implementar detalhes externos que o domínio não conhece.

**`menu.config.ts`** — cardápio como array de `Ingredient`. No V2, isso vira uma chamada de API, mas a interface que o domínio vê não muda.

**`pricing.config.ts`** — preços base por tamanho e lista de pricing rules ativas. Permite ajustar precificação sem alterar código de negócio.

**`WhatsAppFormatter.ts`** — transforma `Order` em string. O template da mensagem fica aqui. Se o template mudar, apenas este arquivo muda.

**`LocalOrderStorage.ts`** — salva/recupera rascunho de pedido no localStorage. Implementa interface `OrderStorage` definida na application layer.

---

### 3.4 Features Layer

**Responsabilidade:** UI React. Conecta o que o usuário vê com os casos de uso da application layer.

**Padrão de um hook de feature:**
```typescript
// features/meal-builder/hooks/useMealBuilder.ts
export function useMealBuilder() {
  const store = useMealBuilderStore()
  const config = useMenuConfig()   // lê infrastructure/config

  const addIngredient = useCallback((ingredient: Ingredient) => {
    const result = BuildMealUseCase.addIngredient(store.meal, ingredient)
    if (result.isOk()) {
      const breakdown = CalculatePriceUseCase.calculate(result.value, config.pricing)
      store.setMeal(result.value)
      store.setPriceBreakdown(breakdown)
    } else {
      store.addError(result.error)
    }
  }, [store, config])

  return { meal: store.meal, breakdown: store.priceBreakdown, addIngredient, ... }
}
```

**Regra:** componentes React não chamam application layer diretamente. Passam por hooks da feature.

---

## 4. Pricing Engine

O pricing engine é o componente mais crítico. Design baseado em **chain de responsabilidade**.

### 4.1 Interface Base
```typescript
// domain/pricing/rules/PricingRule.ts
export interface PricingRule {
  readonly name: string
  apply(meal: Meal, context: PricingContext): PriceAdjustment | null
}

export interface PriceAdjustment {
  ruleName: string
  description: string
  amount: Money       // pode ser positivo (surcharge) ou negativo (desconto)
}

export interface PriceBreakdown {
  basePrice: Money
  adjustments: PriceAdjustment[]
  total: Money        // basePrice + sum(adjustments)
}
```

### 4.2 Regras MVP
```typescript
// 1. Preço base pelo tamanho
BasePricingRule: ContainerSize → Money

// 2. Surcharge por ingrediente premium
PremiumIngredientRule: filtra isPremium=true → soma premiumSurcharge de cada um

// 3. Cobrança de porção extra de proteína
ExtraPortionRule: detecta item com portionCount > 1 → cobra basePrice do ingrediente por porção extra

// 4. Cobrança de adicionais (categoria EXTRA)
ExtraIngredientRule: filtra category=EXTRA → soma basePrice de cada item
```

### 4.3 Engine (orquestração)
```typescript
// domain/pricing/rules/PricingEngine.ts
export class PricingEngine {
  constructor(private rules: PricingRule[]) {}

  calculate(meal: Meal, context: PricingContext): PriceBreakdown {
    const basePrice = this.rules
      .find(r => r instanceof BasePricingRule)!
      .apply(meal, context)!.amount

    const adjustments = this.rules
      .filter(r => !(r instanceof BasePricingRule))
      .map(r => r.apply(meal, context))
      .filter(Boolean) as PriceAdjustment[]

    const total = adjustments.reduce(
      (acc, adj) => Money.add(acc, adj.amount),
      basePrice
    )

    return { basePrice, adjustments, total }
  }
}
```

### 4.4 Regras Futuras (extensões sem modificação)
```typescript
// V2 — Plano semanal
WeeklyPlanDiscountRule: detecta context.isWeeklyPlan → aplica desconto %

// V2 — Combo
ComboDiscountRule: detecta combinações específicas → aplica desconto fixo

// V3 — Tenant-specific
TenantPricingRule: lê configuração do tenant → aplica multiplicador
```

---

## 5. State Management

**Biblioteca:** Zustand (já escolhida pela leveza e compatibilidade com feature-based)

**Padrão:** um store por feature, stores pequenos e focados.

```
mealBuilderStore     — estado da marmita em montagem: Meal, PriceBreakdown, errors, step atual
orderSummaryStore    — estado do pedido final: Order, customer info
menuStore            — cardápio disponível (cache do menu.config.ts)
```

**Regra:** stores não contêm lógica de negócio. São apenas estado + setters. A lógica fica nos hooks de feature.

---

## 6. Fluxo de Dados Completo

```
[User toca em ingrediente]
        ↓
[Feature Component] (IngredientCard.tsx)
        ↓ chama
[Feature Hook] (useMealBuilder.addIngredient)
        ↓ chama
[Application Use Case] (BuildMealUseCase.addIngredient)
        ↓ chama
[Domain Entity] (Meal.addIngredient)
        ↓ chama
[Domain Rule] (MealCompositionRules.validate)
        ↓ resultado: Ok | Err
[Application Use Case] → se Ok:
        ↓ chama
[Pricing Use Case] (CalculatePriceUseCase.calculate)
        ↓ chama
[Domain: PricingEngine.calculate]
        ↓ retorna PriceBreakdown
[Feature Hook] → atualiza
        ↓
[Zustand Store] (mealBuilderStore.setMeal + setPriceBreakdown)
        ↓ dispara re-render
[Feature Components] (MealSummary, PriceDisplay, GramaturaBar)
```

---

## 7. Contratos de Tipos Principais

```typescript
// Ingrediente (domain)
interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  unitGramatura: number
  basePrice: Money
  isPremium: boolean
  premiumSurcharge: Money
  isAvailable: boolean
  allergens: string[]
  tags: string[]
}

// Item na marmita (domain)
interface MealItem {
  ingredient: Ingredient
  portionCount: number          // 1 = padrão; 2 = dobro
  gramatura: number             // calculado: portionCount × unitGramatura
}

// Breakdown de preço (domain)
interface PriceBreakdown {
  basePrice: Money
  adjustments: { ruleName: string; description: string; amount: Money }[]
  total: Money
}

// Cliente (domain/order)
interface Customer {
  name: string
  phone: string
}

// Pedido completo (domain/order)
interface Order {
  id: string
  customer: Customer
  meals: { meal: Meal; breakdown: PriceBreakdown }[]
  totalPrice: Money
  notes: string
  createdAt: Date
}
```

---

## 8. Preparação para Multi-Tenant

Mesmo no MVP client-side, o código é escrito para facilitar a extração futura.

### 8.1 MenuRepository (não hardcode)
```typescript
// application/meal-builder/ports/MenuRepository.ts
export interface MenuRepository {
  getAvailableIngredients(): Promise<Ingredient[]>
}

// infrastructure/config/StaticMenuRepository.ts — implementação MVP
// infrastructure/api/ApiMenuRepository.ts — implementação V2
```

### 8.2 TenantContext (preparado, vazio no MVP)
```typescript
// app/providers/TenantContext.ts
interface TenantConfig {
  id: string
  name: string
  brandColor: string
  whatsappNumber: string
  pricingConfig: PricingConfig
}

// MVP: config estática da Vivere
// V3: carregado via API por subdomínio/slug
```

### 8.3 IDs em UUID
Todos os IDs de entidades usam UUID v4 desde o início. Sem autoincrement sequencial.

### 8.4 PricingConfig externalizado
```typescript
// infrastructure/pricing-config/pricing.config.ts
export const VIVERE_PRICING_CONFIG: PricingConfig = {
  basePrices: {
    [ContainerSize.SMALL]: money(2200),      // R$ 22,00
    [ContainerSize.MEDIUM]: money(2800),     // R$ 28,00
    [ContainerSize.LARGE]: money(3400),      // R$ 34,00
    [ContainerSize.EXTRA_LARGE]: money(4000),// R$ 40,00
  },
  activeRules: ['base', 'premium', 'extra-portion', 'extra-ingredient']
}
// V3: cada tenant tem seu próprio PricingConfig carregado da API
```

---

## 9. Preparação para IA / OCR (Fase 4)

A estrutura atual cria os hooks naturais para IA:

| Ponto de extensão | Feature IA futura |
|---|---|
| `MenuRepository.getAvailableIngredients()` | Retorna ingredientes reconhecidos por OCR de cardápio fotografado |
| `Order.meals[]` | Dataset de treinamento para sugestão ("clientes que pediram X também pediram Y") |
| `PriceBreakdown.adjustments[]` | Input para modelo de otimização de preço por demanda |
| `MealCompositionRules` | Pode incorporar restrições nutricionais por perfil (low carb mode, etc.) |

---

## 10. Roadmap Técnico

### MVP (atual)
- [ ] Domain model completo (Meal, Ingredient, Order, Money)
- [ ] PricingEngine com 4 regras base
- [ ] MealCompositionRules + GramaturaRules
- [ ] Zustand stores para meal-builder e order-summary
- [ ] WhatsAppFormatter
- [ ] menu.config.ts com cardápio da Vivere
- [ ] pricing.config.ts com preços da Vivere

### V2 — Operacional
- [ ] Backend API (Node.js / Bun + Hono/Fastify)
- [ ] Banco de dados (PostgreSQL)
- [ ] MenuRepository via API (substituindo StaticMenuRepository)
- [ ] Painel admin de cardápio
- [ ] Fila de pedidos em tempo real

### V3 — SaaS
- [ ] TenantContext implementado com isolamento por subdomínio
- [ ] PricingConfig por tenant (database-driven)
- [ ] White-label: CSS variables + logo por tenant
- [ ] Onboarding self-service com configuração guiada de cardápio/preços

### V4 — IA
- [ ] OCR integration para digitalização de cardápio
- [ ] Recommendation engine (collaborative filtering)
- [ ] Demand forecasting para produção
