# ARCHITECTURE.md — Arquitetura Técnica

_Atualizado: Fase 3 (2026-05-09). Substitui a versão anterior que descreve a arquitetura pré-refator._

---

## 1. Princípios Fundamentais

### Dependency Rule
Dependências sempre apontam para dentro:

```
features (React/UI)
    ↓ depende de
application (ports, use cases)
    ↓ depende de
domain (tipos puros, regras puras)
    ↑ NUNCA depende de nada acima
```

`src/domain/` é TypeScript puro — sem React, Zustand, localStorage, fetch. Testável com Node.js puro.

### Feature-Based UI
Cada feature é um módulo coeso em `src/features/`. Features comunicam-se via stores Zustand ou domain, nunca importando umas das outras diretamente.

### Repositórios como portas
`IngredientRepository` e `OrderRepository` são interfaces em `application/ports/`. As implementações concretas em `infrastructure/repositories/` usam localStorage hoje e podem ser trocadas por Supabase sem tocar na UI.

---

## 2. Estrutura de Pastas

```
src/
├── domain/
│   ├── catalog/          # Ingredient, Preparation, Category, DietFlag, CATEGORY_LABEL
│   ├── meal/
│   │   ├── index.ts      # re-exports: canAddItem, suggestContainer, computeDietBadges, DIET_FLAG_LABEL
│   │   ├── ContainerSize.ts
│   │   └── rules/
│   │       ├── composition.ts   # canAddItem, suggestContainer, veg-medley exclusivity
│   │       └── dietBadges.ts    # computeDietBadges, DIET_FLAG_LABEL
│   ├── cardapio/         # CompositionItem, Cardapio
│   ├── order/            # Order, Customer, Fulfillment
│   ├── pricing/
│   │   ├── types.ts      # PricingConfig, CompositionRules, CustomerPricingRules, MealPriceResult, OrderPricing
│   │   └── engine.ts     # calculateItemCost, calculateMealPrice, calculateOrderPricing, formatPrice99, formatBRL
│   └── shared/           # (reservado para Money, Result se necessário)
│
├── application/
│   ├── ports/
│   │   ├── IngredientRepository.ts  # CatalogData interface + IngredientRepository port
│   │   └── OrderRepository.ts       # OrderRepository port
│   └── useCases/
│       └── order/
│           └── buildWhatsAppMessage.ts   # monta payload + URL wa.me
│
├── infrastructure/
│   ├── seed/
│   │   └── catalog.seed.json            # seed do catálogo (versionado)
│   ├── repositories/
│   │   ├── IngredientRepositoryLocal.ts # persiste em localStorage 'vivere:catalog'
│   │   └── OrderRepositoryLocal.ts      # persiste em localStorage 'vivere:orders'
│   ├── config/
│   │   └── index.ts                     # ENV (whatsappNumber, adminPassword, brandName)
│   └── ServiceFactory.ts                # { ingredientRepo, orderRepo }
│
├── features/
│   ├── meal-builder/
│   │   ├── store/
│   │   │   └── wizardStore.ts           # Zustand: 9 steps, draftItems, cardapios, customer
│   │   └── components/
│   │       ├── WizardShell.tsx          # step router + slide animation
│   │       ├── HeroScreen.tsx
│   │       ├── CategoryStep.tsx
│   │       ├── IngredientStep.tsx
│   │       ├── PreparationStep.tsx
│   │       ├── GramaturaStep.tsx
│   │       ├── QuantityStep.tsx
│   │       ├── AddMoreStep.tsx
│   │       └── CompositionDrawer.tsx
│   ├── order/
│   │   └── components/
│   │       ├── OrderSummary.tsx          # tela 8: cardápios, preço, form, WhatsApp CTA
│   │       └── ConfirmationScreen.tsx
│   ├── admin/
│   │   ├── store/
│   │   │   └── adminStore.ts            # Zustand: CatalogData + dirty flag + persist
│   │   └── components/
│   │       ├── AdminGate.tsx            # tela de senha
│   │       ├── AdminPanel.tsx           # shell com 6 tabs
│   │       ├── IngredienteDialog.tsx    # dialog de add/edit ingrediente
│   │       └── tabs/
│   │           ├── CustosFixosTab.tsx
│   │           ├── OperacionalTab.tsx
│   │           ├── RegrasClienteTab.tsx
│   │           ├── IngredientesTab.tsx
│   │           ├── PreviewTab.tsx
│   │           └── PedidosTab.tsx
│   └── shared/
│       └── components/
│           ├── AppHeader.tsx
│           └── Logo.tsx
│
├── components/ui/       # shadcn/ui (accordion, badge, button, card, dialog, drawer,
│                        #           input, label, select, separator, sheet, sonner,
│                        #           tabs, tooltip)
│
├── __tests__/
│   ├── pricing.test.ts      # 6 casos: calculateItemCost (4) + calculateMealPrice (2)
│   ├── composition.test.ts  # 5 casos: limites de categoria, peso, veg-medley
│   └── orderPricing.test.ts # 4 casos: frete, frete grátis, desconto 5%, retirada
│
├── lib/utils.ts         # cn()
├── index.css            # design tokens Vivere + @theme inline + animations
├── App.tsx              # Routes: / → WizardShell, /admin → AdminGate
└── main.tsx             # BrowserRouter + StrictMode
```

---

## 3. Pricing Engine

Implementado em `src/domain/pricing/engine.ts`. Fórmula conforme BRIEF Seção 5:

```
finalYield       = ingredient.baseYield × preparation.yieldFactor
costPerKgReady   = ingredient.pricePerKg / finalYield
costPer100g      = costPerKgReady / 10
itemCost         = (grams / 100) × costPer100g

totalIngredientCost = Σ itemCost
rentPerUnit         = monthlyRent / monthlyVolume
cookCostPerUnit     = (cooksPerShift × cookSalaryPerMonth) / monthlyVolume
fixedCostPerUnit    = packaging + delivery + rentPerUnit + cookCostPerUnit + other
totalCost           = totalIngredientCost + fixedCostPerUnit
suggestedPrice      = totalCost × (1 + markupPercentage / 100)
finalPrice          = floor(suggestedPrice) + 0.99
```

---

## 4. Wizard Steps

```
hero → category → ingredient → [preparation?] → gramatura → [quantity →] add-more → summary → confirmation
```

- `preparation` é pulado se o ingrediente tem apenas 1 forma de preparo
- `quantity` é a QtyStep que antecede finalizeCardapio
- `add-more` permite adicionar outro cardápio ou ir para summary
- Animação via `direction: 'forward'|'back'` + `key={step}` no WizardShell

---

## 5. Extensibilidade

- **Backend real**: substituir `IngredientRepositoryLocal` e `OrderRepositoryLocal` por implementações que chamam Supabase — zero mudança na UI
- **Múltiplos clientes (multi-tenant)**: `CatalogData` já inclui `pricingConfig`, `compositionRules`, `customerPricingRules` por instância
- **Auth admin**: substituir `AdminGate` por Supabase Auth — a API do admin store não muda
