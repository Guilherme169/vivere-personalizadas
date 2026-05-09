# BRIEF — REFATORAÇÃO DO PROJETO VIVERE PERSONALIZADAS

> Este é o documento mestre que o Claude Code deve ler integralmente antes de qualquer ação. Acompanha o arquivo `catalog.seed.json` na raiz do projeto. Todas as decisões de produto, técnica, pricing e UX já foram tomadas — não invente novas; consulte aqui.

---

## 0. PAPEL E POSTURA

Você é um engenheiro sênior full-stack especializado em produtos premium mobile-first. Trabalha com cuidado de produto, não só de código. Antes de codar, lê os arquivos relevantes do repositório, entende o estado, e só depois propõe um plano enxuto. Você NÃO faz commits sem pedir, NÃO instala dependências sem necessidade, NÃO cria abstrações que o MVP não exige.

Princípios obrigatórios:
- Mobile-first absoluto. 90% dos clientes usam celular.
- Sensação Apple Configurator / produto premium alimentar. Nunca ERP, nunca planilha, nunca formulário corporativo.
- Real-time onde fizer sentido (preço, peso, restrições atualizam ao escolher).
- Performance: lazy rendering, memoização, baixo re-render, transições leves.
- TypeScript estrito. Sem `any` desnecessário. Tipos exportados do `domain/`.
- Cada arquivo entregue compila e roda.
- Prompts e código devem economizar créditos: ler arquivos sob demanda, evitar reler o mesmo arquivo, evitar narrativas longas.

---

## 1. CONTEXTO DE NEGÓCIO

A **Vivere** vende marmitas congeladas. Esse projeto é o **configurador de marmitas personalizadas sob encomenda** — porta de entrada para clientes que precisam montar sua própria composição (dieta, restrições, preferências). Marmitas a pronta-entrega ficam em outro site, não aqui.

**Marca e tom:**
- Nome: **Vivere**.
- Tagline: *Marmitas personalizadas para o seu dia.*
- Tom: premium, alimentar, simples. Nunca técnico-nutricional pesado.

**Modelo operacional:**
- Pedido mínimo: **5 marmitas iguais por cardápio**. Um pedido pode ter múltiplos cardápios (ex: 5 frango + 5 peixe = 10 unidades, dois cardápios). Frete e descontos calculam pelo total de unidades do pedido.
- Prazo: mínimo 3 dias úteis para preparo + entrega.
- Aceita entrega ou retirada.
- Pagamento e fechamento via WhatsApp por atendente humano. Sistema **não processa pagamento**.
- Quem cadastra ingredientes/preços são os próprios sócios via painel admin.

**Objetivos do MVP:**
1. Aumentar conversão e reduzir atrito do cliente que precisa personalizar.
2. Reduzir erro operacional padronizando a captura do pedido.
3. Validar a personalização estruturada antes de investir em backend, login, IA.

---

## 2. DIAGNÓSTICO DO REPOSITÓRIO ATUAL

Caminho: `/Users/guilherme/Desktop/VIVERE_Personalizadas/`

### O que está bem (preservar)
- DDD montada: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/features/`.
- Value object `Money`, `OrderDraft`, `Customer`, `OrderStatus` em `src/domain/order/`.
- `ContainerSize`, `IngredientCategory`, `Portion`, `MealItem`, `CompositionRules`, `GramaturaRules` em `src/domain/meal/`.
- `ServiceFactory` e padrão de portas/repositórios em `src/application/ports/` e `src/infrastructure/repositories/`.
- Documentação de produto em `docs/` (PROJECT_VISION, DISCOVERY, MVP_SCOPE, ARCHITECTURE).
- Stores Zustand iniciados em `src/features/*/store/`.
- Stack: React 19 + Vite + TS + Tailwind v4 + shadcn (radix-nova) + Zustand. Manter.

### O que está quebrado (consertar)
1. **Pasta literal `@/` na raiz** (`@/components/`, `@/lib/`) — alguém escreveu no caminho literal em vez de usar o alias do Vite. **Deletar inteira**.
2. **Versões erradas no `package.json`** (provável alucinação anterior — corrigir para versões reais antes do `npm install`):
   - `lucide-react: ^1.14.0` → usar `^0.474.0` (ou versão atual estável).
   - `eslint: ^10.2.1` e `@eslint/js: ^10.0.1` → usar `^9.17.0`.
   - `typescript: ~6.0.2` → usar `~5.7.2`.
   - `vite: ^8.0.10` → usar `^7.0.0` (ou compatível com `@vitejs/plugin-react` instalado).
   - `radix-ui: ^1.4.3` → trocar por dependências individuais conforme `npx shadcn add` for instalando.
3. **Apenas `button.tsx` em `src/components/ui/`** — instalar via `npx shadcn@latest add` o que for usado: `card input label tabs dialog drawer sheet badge accordion separator toast tooltip select`.
4. **`App.tsx` monta `KitBuilderShell`** (fluxo antigo de textarea de dieta). Substituir por shell do novo configurador.

### O que remover
- Pasta inteira `src/features/kit-builder/` (fluxo conversacional/textarea — descartado).
- `src/infrastructure/config/tenant.config.ts` e qualquer referência a tenant/white-label nas configs e ServiceFactory. White-label fica para depois; remover ruído.
- Pasta literal `@/` da raiz.
- `src/assets/react.svg` e `vite.svg` se não forem usados.

### O que adaptar
- **PricingEngine atual** (`src/domain/pricing/PricingEngine.ts`) usa modelo de `basePrices` por `ContainerSize` + regras (`PremiumIngredientRule`, `ExtraPortionRule`, `ExtraIngredientRule`). **Substituir** pela fórmula do Lovable (Seção 5). Apagar as 3 regras citadas. Manter os arquivos `types.ts` e `PricingEngine.ts` mas reescrevê-los.
- **`ContainerSize`** vira **informativo** (sugestão visual de tamanho de embalagem com base no peso total da marmita) e **não afeta preço**. Bandas: <300g = P, 300–450g = M, 451–600g = G.
- **`meal-builder/`** já existe esqueleto — finalizar com base no fluxo da Seção 4.

---

## 3. ESCOPO DO MVP (CONGELADO)

Incluir:
1. Configurador público mobile-first, com multi-cardápio.
2. Painel admin (`/admin`) com senha simples.
3. Handoff WhatsApp via link `wa.me`.
4. Persistência local de pedidos gerados (localStorage) — para auditoria mínima.

Não incluir nesta versão:
- Login de cliente / refeições favoritas.
- Upload PDF/imagem da dieta com IA.
- Pagamento online.
- Dashboards de venda.
- White-label multi-tenant.
- WhatsApp Business API.
- Combos / cardápio fixo (vão para outro site).

Persistência: catálogo em `catalog.seed.json` versionado + sobrescrita em runtime via `localStorage` no admin (com export/import JSON). Pedidos vivem só no `localStorage` do navegador (sem servidor). Camada de repositório abstrata para trocar por Supabase depois sem reescrever UI.

---

## 4. FLUXO DETALHADO DO CONFIGURADOR

Wizard mobile-first, uma etapa por tela. Header persistente com peso atual / preço parcial do cardápio em montagem. Transições suaves (slide horizontal). Botão "voltar" sempre visível.

### Tela 1 — Hero
- Headline: **Monte sua marmita personalizada**
- Subheadline: *Escolha ingredientes, preparo e gramatura. Veja o preço em tempo real.*
- CTA grande: **Começar montagem**
- Visual: ilustração/foto premium de marmita. Tipografia Geist 600/500.

### Tela 2 — Categoria
- Cards 2 colunas: Proteínas / Carboidratos / Legumes e verduras / Temperos / Laticínios / Outros.
- Cada card mostra contagem de itens já escolhidos do cardápio atual.
- Limites por cardápio (regras duras): 1 proteína, 2 carboidratos, 3 legumes, 1 tempero, 1 laticínio, 2 outros. Ao bater o limite, a categoria fica desabilitada com tooltip explicando.
- "Seleta de Legumes" é um item da categoria vegetable que, quando selecionado, ocupa os 3 slots de legume (não dá pra adicionar outros legumes junto).

### Tela 3 — Ingrediente
- Lista vertical, busca opcional se categoria > 8 itens.
- Cada item: nome, foto/placeholder, preço estimado por 100g (calculado em tempo real), badges de restrição.
- Catálogo seed: ver `catalog.seed.json`.

### Tela 4 — Forma de Preparo
- Aparece apenas se o ingrediente tiver mais de 1 preparo.
- Cards grandes, máx 4 por tela.
- Ex: Batata inglesa → Inteira / Em cubos / Purê. Frango filé → Desfiado / Em cubos / Em tiras.

### Tela 5 — Gramatura
- Botões pré: 100 / 150 / 200 / 300g + "Outro" (input numérico, step 10g, faixa 50–500g).
- Mostrar preço incremental do item escolhido naquela gramatura, em tempo real.

### Drawer "Composição em montagem" (persistente, colapsável)
A cada escolha, atualiza:
- Lista dos itens (categoria, nome, preparo, gramatura, sub-preço).
- Peso total (alerta se < 200g ou > 600g).
- Recipiente sugerido (P/M/G por bandas de peso).
- Preço unitário do cardápio.
- Badges de restrição atendidas (sem-glúten / vegano / vegetariano / sem-lactose).
- Botões: "Adicionar mais um ingrediente" / "Editar item" (toca em qualquer item da lista) / "Remover item" / "Finalizar este cardápio".

### Tela 6 — Quantidade desse cardápio
- "Quantas unidades desse cardápio você quer?"
- Botões rápidos: 5 / 10 / 15 / 20 + input. Mínimo 5.
- Mostrar preço total do cardápio.

### Tela 7 — Adicionar outro cardápio?
- "Quer adicionar outro cardápio diferente ao mesmo pedido?"
- Botões: **Sim, adicionar outro cardápio** (volta para Tela 1 do wizard com novo cardápio) / **Não, ir para o resumo do pedido**.

### Tela 8 — Resumo do pedido + dados de contato
Card premium mostrando:
- Cada cardápio com sua composição, peso por marmita, recipiente, restrições, qtd, preço unitário, subtotal.
- Total de unidades do pedido.
- Subtotal de marmitas.
- Frete (R$ 6 ou "Frete grátis" se ≥ 6 unidades).
- Desconto (5% se ≥ 11 unidades, 10% se ≥ 16 unidades) aplicado sobre o subtotal de marmitas.
- Valor total final.
- Accordion colapsado "Como calculamos o preço" (texto simples, sem fórmula crua).

Formulário curto (um por baixo do outro, mobile):
- Nome
- Telefone (com máscara BR)
- Modo: Entrega ou Retirada (toggle)
- Endereço (campo único de texto livre, obrigatório se Entrega)
- Restrições/Observações (textarea curta, opcional)

CTA: **Continuar no WhatsApp**.

### Handoff WhatsApp
URL: `https://wa.me/555180889884?text=<encoded>`. Número Vivere já confirmado.

Template:
```
Olá, Vivere! Quero pedir minhas marmitas personalizadas.

🥗 Cardápio 1 — [N] unidades
• [Categoria] [Ingrediente] - [Preparo] - [Xg]
• ...
Peso/marmita: [X]g  •  Recipiente: [P/M/G]
Restrições: [lista ou "—"]

🥗 Cardápio 2 — [N] unidades   (se houver)
...

📦 Total: [N] unidades
💰 Subtotal marmitas: R$ [x],99
🚚 Frete: R$ 6,00 / Frete grátis
🏷️ Desconto: -[5%/10%/—]
💵 Total: R$ [x],99

👤 [Nome]
📞 [Telefone]
🏠 [Endereço ou "Vou retirar"]
📝 Observações: [texto ou "—"]

Aguardo confirmação do prazo e fechamento. Obrigado!
```

Após enviar: salvar o pedido no localStorage (id, timestamp, JSON do pedido) e mostrar tela "Pedido enviado, em breve nosso atendente responde".

---

## 5. ENGINE DE PRECIFICAÇÃO

Fórmula extraída do projeto Lovable `sabor-calculado` que a equipe Vivere já usa. **Fonte da verdade — não inventar**.

### Tipos

```ts
type Category = 'protein' | 'carb' | 'vegetable' | 'seasoning' | 'dairy' | 'other';
type DietFlag = 'sem-gluten' | 'vegano' | 'vegetariano' | 'sem-lactose';

type Preparation = {
  id: string;
  name: string;
  yieldFactor: number;   // multiplica baseYield
};

type Ingredient = {
  id: string;
  name: string;
  category: Category;
  pricePerKg: number;        // R$/kg cru
  baseYield: number;         // kg pronto / kg cru
  preparations: Preparation[];
  dietFlags: DietFlag[];
};

type CompositionItem = {
  ingredientId: string;
  preparationId: string;
  grams: number;
};

type Cardapio = {
  id: string;
  items: CompositionItem[];
  quantity: number;          // mínimo 5
};

type Order = {
  cardapios: Cardapio[];
  customer: { name: string; phone: string; address?: string };
  fulfillment: 'entrega' | 'retirada';
  notes?: string;
};

type PricingConfig = {
  packaging: number;
  delivery: number;
  other: number;
  monthlyRent: number;
  monthlyVolume: number;
  cooksPerShift: number;
  cookSalaryPerMonth: number;
  markupPercentage: number;
};

type CompositionRules = {
  minWeightPerMealG: number;        // 200
  maxWeightPerMealG: number;        // 600
  maxItemsByCategory: Record<Category, number>;
  minMealsPerCardapio: number;      // 5
};

type CustomerPricingRules = {
  deliveryFeeBRL: number;           // 6.00
  freeDeliveryAtTotalUnits: number; // 6
  discount5pctAtTotalUnits: number; // 11
  discount10pctAtTotalUnits: number;// 16
};
```

### Defaults (carregar de `catalog.seed.json` → `pricingDefaults`, `compositionRules`, `customerPricingRules`)

`PricingConfig`: `packaging=1.61, delivery=1.50, other=1.00, monthlyRent=1500, monthlyVolume=1200, cooksPerShift=2, cookSalaryPerMonth=2000, markupPercentage=60`.

### Fórmula

```
// Por item da composição
finalYield     = ingredient.baseYield * preparation.yieldFactor
costPerKgReady = ingredient.pricePerKg / finalYield
costPer100g    = costPerKgReady / 10
itemCost       = (grams / 100) * costPer100g

// Por marmita (preço unitário)
totalIngredientCost = soma(itemCost de todos os items)
rentPerUnit         = monthlyRent / monthlyVolume
cookCostPerUnit     = (cooksPerShift * cookSalaryPerMonth) / monthlyVolume
fixedCostPerUnit    = packaging + delivery + rentPerUnit + cookCostPerUnit + other
totalCost           = totalIngredientCost + fixedCostPerUnit
suggestedPrice      = totalCost * (1 + markupPercentage / 100)
finalPrice          = floor(suggestedPrice) + 0.99   // formatação psicológica fixa

// Por cardápio
cardapioSubtotal = finalPrice * cardapio.quantity

// Por pedido
totalUnits          = soma(cardapio.quantity)
subtotalMarmitas    = soma(cardapioSubtotal)

frete = (totalUnits >= freeDeliveryAtTotalUnits || fulfillment === 'retirada')
        ? 0
        : deliveryFeeBRL

descontoPct = (totalUnits >= discount10pctAtTotalUnits) ? 0.10
            : (totalUnits >= discount5pctAtTotalUnits)  ? 0.05
            : 0

descontoBRL = subtotalMarmitas * descontoPct

totalPedido = subtotalMarmitas - descontoBRL + frete
```

### Regras de composição

- Bloquear adicionar item se exceder `maxItemsByCategory` na categoria.
- Bloquear se peso total ficaria > `maxWeightPerMealG` (600).
- "Seleta de Legumes" (`veg-medley`) é mutuamente exclusivo com outros legumes — ao escolher, marca a categoria `vegetable` como "cheia".
- Avisar (não bloquear) se peso total < `minWeightPerMealG` (200) ao tentar finalizar cardápio. Mostrar mensagem clara.
- Quantidade do cardápio não pode ser < `minMealsPerCardapio` (5).

Implementar TUDO acima como **funções puras** em `src/domain/pricing/` e `src/domain/meal/rules/`. UI consome resultado, nunca recalcula.

---

## 6. RESTRIÇÕES ALIMENTARES

Cada ingrediente declara `dietFlags`. Uma composição "atende" uma restrição se TODOS os itens a possuem.

Comportamento: **proativo e simples** — mostrar badges no drawer da composição quando atender ("Sua marmita está sem glúten ✓"). Não fazer filtro/exclusão de ingredientes — deixar o cliente compor livre e ver as badges aparecerem.

Lógica em função pura `computeDietBadges(items, catalog): DietFlag[]` em `src/domain/meal/rules/`.

---

## 7. PAINEL ADMIN (`/admin`)

Login: senha simples lida de `import.meta.env.VITE_ADMIN_PASSWORD` (sem OAuth). Senha definida: `vivere1213`.

Estrutura em abas (similar ao AdminPanel do Lovable):

1. **Custos Fixos**: inputs para `packaging`, `delivery`, `other`. (Removido `kitchen` do Lovable — era campo morto.)
2. **Operacional**: inputs para `monthlyRent`, `monthlyVolume`, `cooksPerShift`, `cookSalaryPerMonth`, `markupPercentage`. Mostrar derivados em tempo real: `rentPerUnit`, `cookCostPerUnit`, `totalFixedPerUnit`.
3. **Regras de pricing customer-facing**: editar `deliveryFeeBRL`, `freeDeliveryAtTotalUnits`, `discount5pctAtTotalUnits`, `discount10pctAtTotalUnits`.
4. **Ingredientes**: tabela editável (categoria, nome, `pricePerKg`, `baseYield`, formas de preparo com `yieldFactor`, `dietFlags`). Add / edit / remove. Salvar grava no `localStorage` e oferece "Exportar JSON".
5. **Pré-visualização**: composição-exemplo (150g frango filé desfiado + 100g arroz branco + 100g brócolis) mostra como o preço se forma com a configuração atual. Atualiza ao mudar parâmetros.
6. **Pedidos**: lista simples dos pedidos salvos no localStorage (timestamp, total de unidades, valor total, snippet do nome). Botão "Exportar JSON" e "Limpar". Sem analytics — só auditoria mínima.

Botão extra "Importar JSON do catálogo" para sobrescrever (com confirmação).

Toda escrita passa por `IngredientRepository` (interface em `application/ports/`, impl em `infrastructure/repositories/IngredientRepositoryLocal.ts`). Mais tarde troca por Supabase sem mexer na UI.

---

## 8. ARQUITETURA E ORGANIZAÇÃO

Manter DDD existente. Estrutura alvo após o refator:

```
src/
  domain/
    catalog/          # Ingredient, Preparation, Category, DietFlag (mover de meal/Ingredient.ts se preciso)
    meal/             # MealItem, Composition, ContainerSize, rules/{CompositionRules, GramaturaRules, computeDietBadges}
    cardapio/         # Cardapio (composição + qty)
    order/            # Order (lista de cardápios), Customer, OrderStatus
    pricing/          # PricingConfig, fórmula pura, formatPrice99
    shared/           # Money, Result
  application/
    ports/            # IngredientRepository, OrderRepository
    useCases/
      meal/           # add/remove/updateItem, validateMeal
      cardapio/       # createCardapio, addCardapioToOrder
      order/          # buildWhatsAppMessage, persistOrder
      pricing/        # calculateMealPrice, calculateOrderPrice
  infrastructure/
    repositories/     # IngredientRepositoryLocal, OrderRepositoryLocal (localStorage)
    seed/             # catalog.seed.json (movido da raiz)
    config/           # pricing.config.ts, env.ts
    ServiceFactory.ts
  features/           # apenas UI (telas + components específicos)
    meal-builder/     # adapt o existente
    cardapio-builder/ # multi-cardápio
    order/            # resumo + handoff
    admin/            # painel admin
    shared/           # AppServicesProvider, layout
  components/ui/      # shadcn
  routes/             # / e /admin (react-router se já não tiver, instalar)
  lib/utils.ts
  index.css
  App.tsx
  main.tsx
```

Regras:
- Domain não importa de presentation/infrastructure.
- Stores Zustand finas; lógica em domain/application.
- Componentes < 200 linhas; quebrar em subcomponentes.
- Sem `useEffect` para lógica de negócio.

---

## 9. UI / DESIGN SYSTEM (final, aprovado pelo cliente)

> A Fase 1 aplicou uma paleta intermediária no `src/index.css`. **Este sistema substitui aquele.** O primeiro passo da Fase 2 é reescrever `src/index.css` com os tokens abaixo.

### 9.1 Cores (hex extraídos do logo da marca)

Cores de marca (reservadas para identidade — usar com restrição):
- `--color-verde-escuro: #1F4F2E` — wordmark, headings, navegação, ícones sólidos, footer
- `--color-verde-vivo: #2DBE4D` — folha do logo, badges de restrição, ícones de check, pequenos destaques alimentares
- `--color-laranja: #F08534` — CTAs principais, preço destacado, hover de elementos verdes

Hover/active das cores de marca:
- `--color-verde-escuro-hover: #173B22`
- `--color-laranja-hover: #D9742B`

Neutros:
- `--color-creme: #FAF6EE` — background da página inteira
- `--color-surface: #FFFFFF` — cards, inputs, painéis
- `--color-borda: #EDE6D5` — divisores, borda de cards
- `--color-texto: #1A2A1F` — headings, body principal
- `--color-texto-suave: #5C6657` — subtítulos, captions, labels

Semânticos:
- `--color-sucesso: #2DBE4D` (= verde vivo)
- `--color-aviso: #F0A434`
- `--color-erro: #C24438`

Mapear todos como CSS custom properties em `:root` no `src/index.css` e expor via `@theme inline` do Tailwind v4 com aliases curtos: `bg-creme`, `bg-surface`, `text-verde-escuro`, `bg-laranja`, `border-borda`, etc. Não usar nomes genéricos tipo `bg-primary` para as cores de marca — quero ver intenção no código.

### 9.2 Hierarquia de uso (regra dura — não relaxar)

| Cor | Quando usar | Quando NÃO usar |
|---|---|---|
| Verde escuro | Headings, navegação, ícones sólidos, logo, footer, botão secundário (borda) | Como background grande |
| Verde vivo | Badges (sem-glúten, vegano), ícones de check, pequenos destaques | Em botões primários |
| Laranja | CTAs principais (Adicionar, Continuar no WhatsApp), preço destacado, indicador de etapa ativa | Como background, em texto longo |
| Creme | Background da página inteira | Texto |
| Branco | Cards, surfaces, inputs | Background da página |

CTA principal é sempre **laranja**. CTA secundário é sempre **verde escuro outline**. Nunca dois CTAs laranja na mesma tela.

### 9.3 Tipografia

Pareamento serif-display + sans-body (clássico premium):

- **Display / headings**: `Fraunces Variable` (Google Fonts via `@fontsource-variable/fraunces`). Pesos 500 e 600. Usar para H1, H2, preço destacado, número de etapa.
- **Body / UI**: `Geist Variable` (já instalado). Pesos 400, 500, 600. Usar para parágrafo, label, botão, formulário.
- **Eyebrow / caption** (estilo do slogan do logo): Geist 500 maiúsculo com `letter-spacing: 0.08em` e `text-xs`.

Instalar: `npm install @fontsource-variable/fraunces` e importar em `src/main.tsx`.

Tamanhos base mobile (375px viewport):
- H1 (hero): Fraunces 600, 36px, line-height 1.1
- H2 (tela): Fraunces 600, 28px, line-height 1.2
- H3 (seção): Fraunces 500, 22px, line-height 1.3
- Body: Geist 400, 17px, line-height 1.5
- Label: Geist 500, 14px, line-height 1.4
- Caption: Geist 400, 13px, line-height 1.4
- Eyebrow: Geist 500, 12px, uppercase, letter-spacing 0.08em
- Preço destacado: Fraunces 600, 32-40px, tabular-nums

### 9.4 Spacing e Radius

Spacing scale (Tailwind default já atende): 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px, 10=40px, 12=48px, 16=64px.

Border-radius:
- Pequeno (chips, badges): `rounded-full` ou `rounded-xl` (12px)
- Médio (botões, inputs): `rounded-2xl` (16px)
- Grande (cards): `rounded-3xl` (24px)

### 9.5 Sombras (warm shadows com tint verde)

```
--shadow-sm: 0 1px 3px rgba(31, 79, 46, 0.06);
--shadow-md: 0 2px 12px rgba(31, 79, 46, 0.08);
--shadow-lg: 0 8px 28px rgba(31, 79, 46, 0.10);
--shadow-cta: 0 4px 14px rgba(240, 133, 52, 0.30);
```

Cards usam `shadow-md`. Sticky bottom CTA usa `shadow-lg`. Sombra padrão NUNCA é cinza puro — sempre o tint verde para parecer alimentar.

### 9.6 Component recipes (concretos)

- **Botão primário**: `bg-laranja text-white h-12 rounded-2xl px-6 font-medium shadow-cta hover:bg-laranja-hover active:scale-[0.98] transition-all duration-200`
- **Botão secundário**: `bg-transparent border border-verde-escuro text-verde-escuro h-12 rounded-2xl px-6 font-medium hover:bg-verde-escuro/5 active:scale-[0.98]`
- **Botão ghost**: `bg-transparent text-verde-escuro hover:bg-verde-escuro/8 h-11 rounded-xl px-4`
- **Card de ingrediente** (lista vertical): `bg-surface rounded-3xl p-4 shadow-sm border border-borda flex items-center gap-3 active:scale-[0.99] transition-transform`
- **Card de categoria** (Hero/grid): `bg-surface rounded-3xl p-6 shadow-md flex flex-col items-center gap-3 aspect-square active:scale-[0.98]` + ícone `text-verde-escuro h-8 w-8`
- **Chip de gramatura**: `h-11 px-5 rounded-full bg-creme border border-borda text-verde-escuro data-[active=true]:bg-verde-escuro data-[active=true]:text-white data-[active=true]:border-transparent`
- **Badge de restrição** (ex: "Sem glúten ✓"): `inline-flex items-center gap-1 h-7 px-3 rounded-full bg-verde-vivo/12 text-verde-escuro text-xs font-medium`
- **Display de preço**: `font-display font-semibold text-4xl text-verde-escuro tabular-nums`
- **Bottom sticky CTA**: `fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur border-t border-borda px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-2 z-40`
- **Input**: `bg-surface border border-borda rounded-2xl h-12 px-4 text-base placeholder:text-texto-suave focus:outline-none focus:ring-2 focus:ring-verde-escuro/30`
- **Step indicator**: dots ou barra com `bg-borda` para inativo, `bg-laranja` para ativo, `bg-verde-escuro` para concluído.

### 9.7 Motion

Easing padrão: `cubic-bezier(0.2, 0.8, 0.2, 1)` (Apple-like). Definir em CSS:
```
--ease-out-expo: cubic-bezier(0.2, 0.8, 0.2, 1);
```

- Botão tap: `active:scale-[0.98]` em 150ms.
- Card tap: `active:scale-[0.99]` em 150ms.
- Troca de etapa do wizard: slide-x 250ms `--ease-out-expo` + fade 200ms.
- Drawer da composição: slide-y 280ms.
- Hover em desktop: opacity/cor 200ms.

NÃO instalar `framer-motion`. CSS transitions resolvem.

### 9.8 Ícones

`lucide-react` (já vem com shadcn). Tamanhos: 16, 20, 24, 32. Cor padrão `text-verde-escuro`. Stroke-width 1.75 para parecer leve e premium.

### 9.9 Logo

Arquivos já estão em `public/`:
- `logo-verde.png` — versão completa com slogan "ALIMENTAÇÃO QUE ACOMPANHA O SEU RITMO" em verde vivo. Usar em fundos creme/branco.
- `logo-laranja.png` — versão sem slogan, monocromática laranja. Usar em contextos quentes (CTAs grandes, finalizadores) — uso pontual.

Componente `<Logo variant="verde" | "laranja" size="sm" | "md" | "lg" />` em `src/features/shared/components/Logo.tsx`. Default: `variant="verde" size="md"`. Tamanhos: sm = altura 28px, md = 40px, lg = 64px. Usar `<img alt="Vivere" />` com `decoding="async"` e `loading="eager"` no header.

Header padrão das telas: logo verde tamanho md alinhado à esquerda. Hero usa logo verde tamanho lg centralizado.

### 9.10 Diretrizes de NÃO fazer

- Não usar gradientes coloridos como background (apenas sombras com tint).
- Não usar emojis como ícones de UI (só no template do WhatsApp e em badges textuais opcionais).
- Não usar cinza puro (`#CCCCCC`, `#999999`) — sempre `texto-suave` ou `borda` que tem tint quente.
- Não usar mais de uma fonte serif diferente. Fraunces é a única.
- Não animar entrada de itens em listas (cansa em mobile e atrasa percepção de preço).
- Não esconder peso/preço em accordions na tela do cliente — sempre visível.

---

## 10. PARÂMETROS DE AMBIENTE

Criar `.env.example`:
```
VITE_WHATSAPP_NUMBER=555180889884
VITE_ADMIN_PASSWORD=vivere1213
VITE_BRAND_NAME=Vivere
```

Instruir no README a copiar para `.env.local`.

---

## 11. PLANO DE EXECUÇÃO — 3 FASES

Ao iniciar, criar branch `refactor/configurador-vivere` a partir de `main` (ou da branch atual). Commitar ao final de cada fase com mensagem descritiva. Não pushar — deixar o usuário revisar.

### FASE 1 — Saneamento (executar e parar)

1. `npm install` — observar erros.
2. Corrigir `package.json` com versões reais (ver Seção 2).
3. `rm -rf @` (deletar pasta literal).
4. Deletar `src/features/kit-builder/` inteira.
5. Deletar `src/infrastructure/config/tenant.config.ts` e remover referências.
6. Instalar shadcn faltantes: `npx shadcn@latest add card input label tabs dialog drawer sheet badge accordion separator toast tooltip select`.
7. Reescrever `src/App.tsx` para montar uma Hero placeholder ("Vivere — em construção") com a nova paleta.
8. Garantir que `npm run dev` sobe sem erro e mostra a Hero.
9. Commit: `chore: phase 1 — sanitize project, fix deps, remove old kit-builder`.
10. Resumir o que mudou em até 8 linhas e PARAR. Aguardar o usuário dizer "ok" para seguir Fase 2.

### FASE 2 — Configurador completo (executar quando autorizado)

**0. Design system primeiro** (antes de qualquer tela):
   - Reescrever `src/index.css` com TODOS os tokens da Seção 9.1 (cores, sombras, easing) como CSS custom properties em `:root`. Apagar a paleta intermediária aplicada na Fase 1.
   - Mapear via `@theme inline` do Tailwind v4 com aliases curtos: `bg-creme`, `text-verde-escuro`, `bg-laranja`, `border-borda`, `shadow-cta`, etc.
   - `npm install @fontsource-variable/fraunces`. Importar Fraunces e confirmar Geist em `src/main.tsx`.
   - Definir famílias no `@theme`: `font-display: 'Fraunces Variable'`, `font-sans: 'Geist Variable'`.
   - Criar `src/features/shared/components/Logo.tsx` consumindo `public/logo-verde.png` e `public/logo-laranja.png` (variantes `verde` | `laranja`, tamanhos `sm` | `md` | `lg`).
   - Atualizar `src/App.tsx` Hero placeholder usando o componente Logo, font-display nos headings, botão laranja conforme recipe da Seção 9.6. Validar visualmente em viewport 375px antes de seguir.

1. Mover `catalog.seed.json` da raiz para `src/infrastructure/seed/`.
2. Criar/ajustar tipos do domínio (Seção 5).
3. Implementar `IngredientRepositoryLocal` (lê do seed, sobrescrevível por localStorage).
4. Implementar engine de pricing pura + formatPrice99 + cálculo de pedido com frete/desconto.
5. Implementar regras de composição puras (limites por categoria, min/max peso, exclusividade da Seleta de Legumes).
6. Implementar `computeDietBadges`.
7. Construir as 8 telas (Seção 4) reusando o que já existe em `meal-builder/`. Cada tela deve seguir os component recipes da Seção 9.6 — não inventar estilos paralelos.
8. Construir handoff WhatsApp (Seção 4).
9. Persistência de pedido no localStorage via `OrderRepositoryLocal`.
10. Smoke test manual: simular pedido com 2 cardápios, checar mensagem do WhatsApp.
11. Commit: `feat: phase 2 — design system + configurador completo com multi-cardápio e handoff WhatsApp`.
12. Resumir e PARAR.

### FASE 3 — Admin + testes + polish

1. Rota `/admin` com gate de senha (`VITE_ADMIN_PASSWORD`).
2. Implementar 6 abas do admin (Seção 7).
3. Adicionar Vitest e escrever testes para: pricing engine (4 casos), regras de composição (5 casos), cálculo de pedido com desconto/frete (4 casos).
4. Atualizar README (como rodar, como editar catálogo, env vars).
5. Atualizar `CLAUDE.md` apontando para este BRIEF e refletindo a nova arquitetura.
6. Atualizar `docs/PROJECT_VISION.md`, `docs/MVP_SCOPE.md`, `docs/ARCHITECTURE.md` para refletir a nova direção. `docs/DISCOVERY.md` ganha nota de "atualizado em [data]".
7. Polimento mobile: testar em viewport 375×667 e 390×844.
8. Commit: `feat: phase 3 — admin panel, tests, docs refresh`.

---

## 12. PARÂMETROS JÁ DEFINIDOS

NÃO perguntar de novo. Embutir direto no código/env:

- WhatsApp: `555180889884` (já validado).
- Senha admin: `vivere1213`.
- Marca: `Vivere`. Tagline: `Marmitas personalizadas para o seu dia`.
- Paleta: Seção 9.
- Logo: placeholder textual até o usuário enviar `public/logo.svg`.
- Defaults de pricing e regras: vêm do `catalog.seed.json`.
- Formatação de preço cliente: sempre `.99` (drop `.49`).

### Itens em que pode pedir confirmação UMA vez no início (em mensagem agrupada)

1. Conferência rápida das `dietFlags` no catálogo (resumo: X ingredientes vegano, Y sem glúten, Z sem lactose — está coerente?).
2. Interpretação dos cortes "mais que 5/10/15" para frete grátis e descontos: usei `≥6 grátis`, `≥11 = 5%`, `≥16 = 10%`. Confirma?

---

## 13. ENTREGA AO FIM DE CADA FASE

Mensagem curta com:
- Lista de arquivos criados/modificados/removidos.
- Como testar a fase manualmente.
- O que ficou mockado / pendente.
- Se algo da Seção 12 não foi confirmado, o que foi assumido.

Sem relatórios extensos. Sem reescrever este BRIEF.
