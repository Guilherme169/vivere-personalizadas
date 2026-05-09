# BRIEF V2 — VIVERE PERSONALIZADAS

> Continuação do BRIEF v1 (já implementado nas Fases 1–3 + ajustes de design system). Este documento cobre as **Fases 4, 5 e 6**, focadas em backend Supabase, recursos de cliente recorrente, páginas institucionais e expansão multi-cidade.
>
> **Antes de colar, faça duas coisas:**
> 1. Tem o `BRIEF_V2.md` na raiz do projeto (este arquivo).
> 2. Atualizou `.env.local` com as credenciais Supabase (Seção 10).

---

## 0. PAPEL E POSTURA (mantém da v1)

Engenheiro sênior full-stack mobile-first. Cuidado de produto. Lê arquivos antes de codar. NÃO commita sem pedir, NÃO instala dependências sem necessidade. Mobile-first absoluto, sensação Apple Configurator. TypeScript estrito. Cada arquivo entregue compila e roda.

Princípios adicionais para v2:
- **Zero downtime na migração**: o app deve continuar funcionando para clientes durante e após a migração. Se Supabase falhar, fallback para localStorage no admin (catálogo) e manter o handoff WhatsApp funcionando mesmo offline.
- **Repositories já existem** (`IngredientRepositoryLocal`, `OrderRepositoryLocal`). NÃO mexer na UI nem nas stores Zustand — só trocar a implementação dentro de `infrastructure/repositories/`.

---

## 1. ESTADO ATUAL (final da v1)

Caminho: `/Users/guilherme/Desktop/VIVERE_Personalizadas/`. Deploy: `https://vivere-personalizadas.vercel.app/`.

**O que já funciona:**
- Configurador completo: Hero → Categoria → Ingrediente → Preparo → Gramatura → Quantidade → Adicionar mais? → Resumo → WhatsApp.
- Multi-cardápio (cliente cria N cardápios, cada um com mín. 5 unidades).
- Pricing engine puro (16 testes Vitest).
- Painel admin em `/admin` com 6 abas, protegido por `VITE_ADMIN_PASSWORD=vivere1213` (hardcoded no env do cliente — inseguro).
- Catálogo + parâmetros em `localStorage`. Pedidos em `localStorage` também.
- Handoff WhatsApp via `wa.me/555180889884`.
- Design system Vivere (verde escuro `#1F4F2E`, verde vivo `#2DBE4D`, laranja `#F08534`, creme `#FAF6EE`), Fraunces + Geist, ícones lucide.
- Logo SVG verde (`/logo.svg` e `/logo_slogan.svg`), favicon Vivere, Open Graph configurado.

**Limitações que a v2 resolve:**
- Catálogo e pedidos vivem só no navegador do usuário. Se ele limpa cache, perde tudo. Você não vê pedidos de outro dispositivo.
- Senha admin hardcoded no bundle JS (qualquer um abre DevTools e descobre).
- Não há histórico de pedidos por cliente (favoritos, repetir).
- Não há página institucional, nem política de privacidade, nem NPS.
- Frete e dias de entrega são iguais para qualquer cidade (não preparado para Osório).

---

## 2. OBJETIVOS DA V2

1. **Mover catálogo, parâmetros e pedidos para Supabase.** Você passa a ver e gerenciar de qualquer dispositivo.
2. **Auth real do admin** via Supabase Auth (email + senha). Acaba a senha hardcoded.
3. **Identificação leve do cliente por telefone** — sem login, mas com persistência: o cliente vê seus pedidos passados e marmitas favoritas se digitar o mesmo telefone.
4. **Salvar marmita favorita / repetir pedido**.
5. **Mensagem WhatsApp ganha bloco de pagamento** (Pix / cartão por link / dinheiro).
6. **Páginas institucionais**: Sobre, Privacidade, rodapé com CNPJ + endereço + Instagram.
7. **NPS pós-pedido**: link `/avaliar/[orderId]` enviado no WhatsApp depois da entrega.
8. **Estrutura multi-cidade preparada** para Osório (admin define cidade, frete, dias de entrega).

**O que NÃO entra na v2** (ficam para v3):
- Cupom de desconto.
- Pixel Meta / Google Analytics / outros trackers.
- App nativo iOS/Android (PWA está bom).
- White-label multi-tenant.
- Status de pedido client-side (cliente vê em qual etapa o pedido está).

---

## 3. SCHEMA SUPABASE (SQL completo)

Rodar este SQL **uma vez** no SQL Editor do Supabase dashboard antes de começar a Fase 4. Está pronto pra copiar e colar.

```sql
-- =========================================================================
--  Vivere Personalizadas — schema inicial (v2)
-- =========================================================================

-- Helper: triggers de updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- 1. INGREDIENTES (catálogo)
-- =========================================================================
CREATE TABLE ingredients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id  TEXT UNIQUE NOT NULL,    -- ex: 'beef-round-dry' (id do seed)
  name         TEXT NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('protein','carb','vegetable','seasoning','dairy','other')),
  price_per_kg NUMERIC(10,2) NOT NULL CHECK (price_per_kg >= 0),
  base_yield   NUMERIC(4,3)  NOT NULL CHECK (base_yield > 0 AND base_yield <= 1.5),
  preparations JSONB         NOT NULL,  -- [{id, name, yieldFactor}]
  diet_flags   TEXT[]        NOT NULL DEFAULT '{}',
  active       BOOLEAN       NOT NULL DEFAULT TRUE,
  position     INT           NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX ingredients_category_active_idx ON ingredients (category, active);
CREATE TRIGGER ingredients_updated_at BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================================
-- 2. APP_SETTINGS (singleton key-value para configs)
-- =========================================================================
CREATE TABLE app_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seeds iniciais
INSERT INTO app_settings (key, value) VALUES
  ('pricing_config', '{"packaging":1.61,"delivery":1.50,"other":1.00,"monthlyRent":1500,"monthlyVolume":1200,"cooksPerShift":2,"cookSalaryPerMonth":2000,"markupPercentage":60}'::jsonb),
  ('composition_rules', '{"minWeightPerMealG":200,"maxWeightPerMealG":600,"maxItemsByCategory":{"protein":1,"carb":2,"vegetable":3,"seasoning":1,"dairy":1,"other":2},"minMealsPerCardapio":5}'::jsonb),
  ('customer_pricing_rules', '{"deliveryFeeBRL":6.00,"freeDeliveryAtTotalUnits":6,"discount5pctAtTotalUnits":11,"discount10pctAtTotalUnits":16}'::jsonb);

-- =========================================================================
-- 3. FULFILLMENT_ZONES (cidades atendidas)
-- =========================================================================
CREATE TABLE fulfillment_zones (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug                     TEXT UNIQUE NOT NULL,
  city_name                     TEXT NOT NULL,
  delivery_fee_brl              NUMERIC(10,2) NOT NULL DEFAULT 6.00,
  free_delivery_at_total_units  INT NOT NULL DEFAULT 6,
  delivery_days                 TEXT[] NOT NULL DEFAULT '{}',  -- ex: ['monday','tuesday','wednesday','thursday','friday'] ou ['saturday']
  delivery_period               TEXT,                          -- ex: 'manhã', 'tarde', 'todo dia'
  active                        BOOLEAN NOT NULL DEFAULT TRUE,
  notes                         TEXT,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO fulfillment_zones (city_slug, city_name, delivery_fee_brl, delivery_days, delivery_period) VALUES
  ('santo_antonio_da_patrulha', 'Santo Antônio da Patrulha - RS', 6.00, ARRAY['monday','tuesday','wednesday','thursday','friday'], 'todo dia'),
  ('osorio', 'Osório - RS', 6.00, ARRAY['saturday'], 'manhã');

-- =========================================================================
-- 4. CUSTOMERS (identificação leve por telefone)
-- =========================================================================
CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         TEXT UNIQUE NOT NULL,    -- normalizado: somente dígitos, com DDI+DDD (ex: 5551999998888)
  name          TEXT NOT NULL,
  last_address  TEXT,
  total_orders  INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================================
-- 5. ORDERS (pedidos)
-- =========================================================================
CREATE TABLE orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id          UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name        TEXT NOT NULL,    -- snapshot
  customer_phone       TEXT NOT NULL,    -- snapshot
  customer_address     TEXT,
  fulfillment          TEXT NOT NULL CHECK (fulfillment IN ('entrega','retirada')),
  city_slug            TEXT REFERENCES fulfillment_zones(city_slug),
  payload              JSONB NOT NULL,   -- snapshot completo: cardapios, items, pricing
  notes                TEXT,
  total_units          INT NOT NULL CHECK (total_units >= 5),
  total_brl            NUMERIC(10,2) NOT NULL CHECK (total_brl >= 0),
  status               TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','confirmado','em_preparo','pronto','entregue','cancelado')),
  whatsapp_sent_at     TIMESTAMPTZ,
  nps_invited_at       TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX orders_customer_idx ON orders (customer_id, created_at DESC);
CREATE INDEX orders_status_idx ON orders (status, created_at DESC);
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger: ao criar order, incrementar total_orders do customer
CREATE OR REPLACE FUNCTION increment_customer_orders()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE customers SET total_orders = total_orders + 1 WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_increment_customer AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION increment_customer_orders();

-- =========================================================================
-- 6. SAVED_MEALS (favoritos do cliente)
-- =========================================================================
CREATE TABLE saved_meals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,           -- 'Marmita do almoço', 'Frango com legumes', etc.
  composition JSONB NOT NULL,          -- [{ingredientExternalId, preparationId, grams}]
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX saved_meals_customer_idx ON saved_meals (customer_id, created_at DESC);

-- =========================================================================
-- 7. NPS_RESPONSES (avaliações pós-pedido)
-- =========================================================================
CREATE TABLE nps_responses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  score      INT NOT NULL CHECK (score >= 0 AND score <= 10),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE ingredients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_zones   ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_meals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_responses       ENABLE ROW LEVEL SECURITY;

-- Public READ: ingredientes ativos, configs, zonas ativas
CREATE POLICY "public_read_active_ingredients" ON ingredients
  FOR SELECT TO anon USING (active = true);

CREATE POLICY "public_read_app_settings" ON app_settings
  FOR SELECT TO anon USING (true);

CREATE POLICY "public_read_active_zones" ON fulfillment_zones
  FOR SELECT TO anon USING (active = true);

-- Public INSERT: customers (upsert por telefone), orders, nps
CREATE POLICY "public_insert_customers" ON customers
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "public_update_own_customer" ON customers
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
-- Nota: o cliente só consegue saber phone+id próprio porque a app sempre passa o phone digitado.
-- Para reforço, pode-se criar uma RPC `get_customer_by_phone` e bloquear SELECT direto.

CREATE POLICY "public_read_own_customer" ON customers
  FOR SELECT TO anon USING (true);
-- (Para v2 deixamos aberto. Em v3, restringir via RPC.)

CREATE POLICY "public_insert_orders" ON orders
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "public_read_own_orders" ON orders
  FOR SELECT TO anon USING (true);
-- (Idem: em v3, restringir por phone via RPC.)

CREATE POLICY "public_manage_own_saved_meals" ON saved_meals
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "public_insert_nps" ON nps_responses
  FOR INSERT TO anon WITH CHECK (true);

-- ADMIN (authenticated user): full access em tudo
CREATE POLICY "admin_full_access_ingredients" ON ingredients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_app_settings" ON app_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_fulfillment_zones" ON fulfillment_zones
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_customers" ON customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_orders" ON orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_saved_meals" ON saved_meals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_nps" ON nps_responses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

**Importante:** o usuário (Guilherme) precisa criar manualmente o usuário admin no Supabase dashboard (Authentication → Users → Add User → email + senha) **antes** de executar a Fase 4. Email sugerido: `guilherme.buhler@birdie.ai`. Senha: o que preferir.

---

## 4. AUTH ESTRATÉGIA

### Admin
- Supabase Auth com email + senha.
- Login na rota `/admin/login` (substitui o `AdminGate` atual com senha).
- Rota `/admin` exige sessão ativa, redireciona para `/admin/login` se não tiver.
- Sessão persistida via Supabase JS SDK (cookie httpOnly + localStorage).
- Logout via botão no AppHeader do admin.

### Cliente
- **Sem login.** A identificação é por telefone normalizado.
- Quando o cliente preenche nome+telefone no formulário do pedido:
  - O telefone é normalizado: `removeAll(non-digits)`, garantir começar com `55`. Ex: `(51) 99999-8888` → `5551999998888`.
  - Faz upsert em `customers` (insert ou update por `phone`).
  - Salva `customer_id` em `localStorage` para preencher próximas visitas.
- Próxima visita: localStorage tem `customer_id` → app busca no Supabase e pré-preenche nome/endereço, mostra "Repetir último pedido" e "Marmitas favoritas".

---

## 5. WHATSAPP — TEMPLATE ATUALIZADO

`src/application/useCases/order/buildWhatsAppMessage.ts` ganha bloco de pagamento ao final, antes de "Aguardo confirmação":

```
💳 Forma de pagamento (responda abaixo):
( ) PIX
( ) Cartão (link de pagamento)
( ) Dinheiro (na entrega/retirada)
```

A mensagem completa fica:

```
Olá, Vivere! Quero pedir minhas marmitas personalizadas.

🥗 Cardápio 1 — [N] unidades
• [Categoria] [Ingrediente] - [Preparo] - [Xg]
...
Peso/marmita: [X]g  •  Recipiente: [P/M/G]
Restrições: [lista ou "—"]

📦 Total: [N] unidades
💰 Subtotal marmitas: R$ [x],99
🚚 Frete: R$ 6,00 / Frete grátis
🏷️ Desconto: -[5%/10%/—]
💵 Total: R$ [x],99

👤 [Nome]
📞 [Telefone]
🏠 [Endereço ou "Vou retirar"]
🏙️ Cidade: [cidade selecionada]
📝 Observações: [texto ou "—"]

💳 Forma de pagamento (responda abaixo):
( ) PIX
( ) Cartão (link de pagamento)
( ) Dinheiro (na entrega/retirada)

Aguardo confirmação do prazo e fechamento. Obrigado!
```

---

## 6. PÁGINAS INSTITUCIONAIS

### Rotas a adicionar
- `/sobre` — quem é a Vivere, foto, endereço, Instagram.
- `/privacidade` — Política de Privacidade (template LGPD, ver Seção 7).
- `/avaliar/:orderId` — formulário NPS (0–10 + comentário opcional).
- `/repetir` — abre se localStorage tem `customer_id`. Mostra "Olá [Nome]! Repetir último pedido?" e lista de favoritos.

### Rodapé permanente

Componente `<AppFooter />` que aparece no Hero, /sobre, /privacidade, /avaliar (não nas telas internas do wizard, para não atrapalhar mobile):

```
─────────────────────────────────────
Vivere · Marmitas personalizadas
R. Sezefredo da Costa Tôrres, 373
Centro · Santo Antônio da Patrulha · RS
CEP 95500-000

CNPJ: 63.053.609/0001-49

Instagram: @viverealimentos  →  https://instagram.com/viverealimentos
WhatsApp: (51) 8088-9884      →  https://wa.me/555180889884

Política de Privacidade  ·  Sobre
─────────────────────────────────────
```

---

## 7. POLÍTICA DE PRIVACIDADE (template LGPD)

Salvar em `src/features/legal/components/PrivacyPolicy.tsx`. Texto inicial:

```markdown
# Política de Privacidade — Vivere

Última atualização: [DATA].

## 1. Quem somos
Vivere Alimentos
CNPJ: 63.053.609/0001-49
R. Sezefredo da Costa Tôrres, 373 · Centro
Santo Antônio da Patrulha · RS · CEP 95500-000
Contato: WhatsApp (51) 8088-9884 · @viverealimentos

## 2. Quais dados coletamos
Quando você monta uma marmita personalizada e finaliza o pedido pelo nosso site, coletamos:
- Nome
- Telefone (WhatsApp)
- Endereço de entrega (se você optar por entrega)
- Observações que você incluir no pedido
- Histórico de pedidos e marmitas favoritas (quando você usa o mesmo telefone)

Não coletamos CPF, dados de cartão, senhas ou dados sensíveis.

## 3. Por que coletamos
- Para preparar e entregar sua marmita.
- Para entrar em contato pelo WhatsApp confirmando o pedido.
- Para você poder repetir pedidos anteriores e usar suas marmitas favoritas em visitas futuras.

## 4. Quem tem acesso
Apenas a equipe da Vivere (sócios e atendentes do WhatsApp). Não compartilhamos seus dados com terceiros, exceto quando exigido por lei.

## 5. Onde guardamos
Em servidores do Supabase (provedor de banco de dados em nuvem) e do Vercel (provedor de hospedagem do site). Ambos com criptografia em trânsito (HTTPS) e em repouso.

## 6. Quanto tempo guardamos
- Pedidos: por tempo indeterminado, para fins de histórico operacional e fiscal.
- Marmitas favoritas: enquanto você quiser. Você pode pedir a exclusão a qualquer momento.

## 7. Seus direitos (LGPD)
Você pode, a qualquer momento, solicitar:
- Acesso aos seus dados.
- Correção de informações incorretas.
- Exclusão dos seus dados (exceto pedidos já pagos, que precisam ser mantidos por exigência fiscal).
- Confirmação de quais dados temos sobre você.

Para exercer qualquer um desses direitos, envie mensagem pelo WhatsApp (51) 8088-9884 com o assunto "Solicitação LGPD".

## 8. Cookies
Usamos apenas armazenamento local do navegador (`localStorage`) para guardar seu identificador de cliente — assim você não precisa digitar telefone e endereço toda vez. Não usamos cookies de publicidade nem rastreadores de terceiros.

## 9. Alterações
Esta política pode ser atualizada. A data no topo indica quando foi a última revisão.

## 10. Dúvidas
Qualquer dúvida sobre esta política, fale com a gente pelo WhatsApp.
```

---

## 8. NPS PÓS-PEDIDO

### Fluxo
1. Cliente envia pedido → grava `orders.created_at`.
2. Quando o atendente marca o pedido como `entregue` no admin → trigger marca `nps_invited_at = now()`.
3. Atendente envia link manualmente pelo WhatsApp: `https://vivere-personalizadas.vercel.app/avaliar/<orderId>`.
4. Cliente abre o link → escolhe nota (0–10) com slider/botões grandes mobile-first → comentário opcional → envia.
5. Resposta grava em `nps_responses`.

### Tela `/avaliar/[orderId]`
- Validar se `orderId` existe em `orders`. Se não, mostrar "pedido não encontrado".
- Validar se já tem resposta NPS — se sim, mostrar "Obrigado pela avaliação!".
- Layout mobile-first:
  - Logo Vivere (com slogan)
  - "Como foi sua experiência com a Vivere?"
  - Slider 0–10 com legenda visual (😞 → 😊)
  - Caixa de texto opcional: "Quer comentar algo? (opcional)"
  - Botão laranja "Enviar avaliação"
- Após envio: tela de agradecimento com CTA "Fazer novo pedido" → `/`.

### Admin
Nova aba "NPS" no admin: lista respostas, mostra média, NPS calculado (`promotores_pct - detratores_pct`), filtros por mês.

---

## 9. MULTI-CIDADE

### Comportamento
- Tabela `fulfillment_zones` define cidades, frete, dias de entrega.
- No formulário de pedido, **se cidade for "entrega"**, mostrar dropdown "Cidade" com as zonas ativas.
- Frete e regras de desconto seguem o que está configurado para aquela cidade.
- Mensagem de aviso na tela de resumo se a cidade tiver dias específicos: "Entregas em Osório acontecem aos sábados pela manhã."

### Admin
Nova aba "Zonas" no admin: CRUD de `fulfillment_zones`. Campos: cidade, frete, dias de entrega (multi-select), período, observações.

---

## 10. VARIÁVEIS DE AMBIENTE

Atualizar `.env.example` e instruir no README a copiar para `.env.local`:

```env
VITE_WHATSAPP_NUMBER=555180889884
VITE_BRAND_NAME=Vivere

# Supabase
VITE_SUPABASE_URL=https://ndwbrlsnfiwzxbiptidw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kd2JybHNuZml3enhiaXB0aWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMzg5NTMsImV4cCI6MjA5MzkxNDk1M30.V9bb4NHm_1uFx-eZ5spJWBayD1ecI42ewOYU_e5MAbQ
```

**Remover** `VITE_ADMIN_PASSWORD` do `.env.example` e do código (passa a ser Supabase Auth).

**No Vercel**, adicionar essas duas vars em Settings → Environment Variables → Production e Preview. Sem elas, o deploy não consegue conectar no Supabase.

---

## 11. PLANO DE EXECUÇÃO — FASES 4, 5, 6

Branch sugerida: `feat/v2-supabase`. Commits ao fim de cada fase. Não pushar — usuário revisa e empurra manualmente.

### FASE 4 — Backend Supabase + Auth (executar primeiro)

**Pré-requisito do usuário (fora do Claude Code):**
- Rodar o SQL da Seção 3 inteiro no SQL Editor do Supabase dashboard.
- Criar usuário admin em Authentication → Users → Add User: email `guilherme.buhler@birdie.ai`, senha à escolha.
- Atualizar `.env.local` com as vars da Seção 10.

**Passos do Claude Code:**

1. `npm install @supabase/supabase-js`.
2. Criar `src/infrastructure/supabase/client.ts`:
   ```ts
   import { createClient } from '@supabase/supabase-js'
   const url = import.meta.env.VITE_SUPABASE_URL
   const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
   if (!url || !anonKey) throw new Error('Faltam as variáveis VITE_SUPABASE_*')
   export const supabase = createClient(url, anonKey, {
     auth: { persistSession: true, autoRefreshToken: true }
   })
   ```
3. Criar `src/infrastructure/repositories/IngredientRepositorySupabase.ts` — implementa a mesma interface do `IngredientRepositoryLocal`. Lê de `ingredients` table, escreve no upsert. Mapeia `external_id` ↔ id do seed.
4. Criar `src/infrastructure/repositories/AppSettingsRepositorySupabase.ts` — wrapper para ler/escrever `app_settings` (key=`pricing_config`, etc.).
5. Criar `src/infrastructure/repositories/OrderRepositorySupabase.ts` — substitui localStorage. Recebe `Order` montado, normaliza telefone, faz upsert em `customers`, insere em `orders`.
6. Atualizar `ServiceFactory.ts` para usar as implementações Supabase em vez das Local. **Manter as Local como fallback** quando `VITE_SUPABASE_URL` não estiver definido (útil para desenvolvimento offline).
7. Criar **migration script de catálogo**: arquivo `scripts/seed-supabase.ts` que lê `src/infrastructure/seed/catalog.seed.json` e faz `upsert` em `ingredients` (idempotente, baseado em `external_id`). Documentar no README como rodar uma vez.
8. **Auth admin:**
   - Substituir `AdminGate.tsx` por componente que faz `supabase.auth.signInWithPassword({ email, password })`.
   - Tela com email + senha. Mensagens de erro claras.
   - `AdminPanel.tsx` lê sessão via `supabase.auth.getSession()` e redireciona para login se não tiver.
   - Botão "Sair" no header do admin chama `supabase.auth.signOut()`.
   - **Remover** `VITE_ADMIN_PASSWORD` de tudo: env, código, docs.
9. **Atualizar admin** para ler/escrever via Supabase em vez de localStorage. As 6 abas continuam idênticas visualmente — só muda a fonte dos dados.
10. Smoke test: login no admin, editar um ingrediente, ver que persiste após reload e em outro device.
11. Commit: `feat: phase 4 — supabase backend + admin auth`.
12. PARAR e mostrar resumo (Seção 13).

### FASE 5 — Cliente recorrente + favoritos + WhatsApp atualizado

1. Criar `src/domain/customer/` com tipos `Customer`, `SavedMeal`, e função `normalizePhone(input): string`.
2. Criar `src/infrastructure/repositories/CustomerRepositorySupabase.ts` — métodos `upsertByPhone`, `findByPhone`, `getById`.
3. Criar `src/infrastructure/repositories/SavedMealRepositorySupabase.ts` — métodos `listByCustomer`, `save`, `delete`.
4. **Identificação no formulário do pedido**: ao digitar telefone (com debounce), buscar customer. Se existe, pré-preencher nome e endereço. Mostrar "Bem-vindo de volta, [Nome]!".
5. **Botão "Salvar essa marmita"** na tela 7 (Resumo do pedido) — abre dialog, pede nome ("Marmita do almoço"), salva.
6. **Tela `/repetir`**: se localStorage tem `vivere:customer_id`, mostra:
   - "Olá, [Nome]! Que bom te ver de novo."
   - Lista das marmitas favoritas como cards (nome, peso, preço estimado).
   - Tocar em uma → carrega no draft do wizard, navega para tela 6 (Quantidade).
   - Botão "Repetir último pedido" → carrega o último pedido em `orders` daquele cliente, vai para resumo.
   - Botão "Montar nova marmita" → fluxo normal a partir do Hero.
7. **WhatsApp template** — atualizar `buildWhatsAppMessage.ts` com bloco de pagamento e linha de cidade (Seção 5).
8. **Toggle Entrega/Retirada** — se Entrega, mostrar dropdown de cidade (carregado de `fulfillment_zones`). Validar regras dia/período.
9. Commit: `feat: phase 5 — customer identification, favorites, repeat order, WhatsApp payment block`.
10. PARAR e mostrar resumo.

### FASE 6 — Páginas institucionais + NPS + multi-cidade no admin

1. Criar componente `<AppFooter />` (Seção 6) e adicionar nas rotas externas (Hero, /sobre, /privacidade, /avaliar).
2. Criar página `/sobre` simples (Logo, parágrafo "Quem é a Vivere", endereço, IG, WhatsApp).
3. Criar página `/privacidade` com o texto da Seção 7 renderizado em prose (pode usar `react-markdown` ou hardcodar como JSX). Adicionar `Última atualização: [data atual]` dinâmico.
4. Criar página `/avaliar/[orderId]` (Seção 8). Slider 0–10 grande, mobile-first, comentário opcional, botão laranja.
5. Adicionar aba "NPS" no admin: lista respostas com nota, comentário, data, link para o pedido. Calcular NPS agregado no topo (promotores 9-10, neutros 7-8, detratores 0-6).
6. Adicionar aba "Zonas" no admin: CRUD de `fulfillment_zones` (Seção 9).
7. Atualizar README com:
   - Como rodar o SQL no Supabase.
   - Como criar usuário admin.
   - Como configurar `.env.local`.
   - Como rodar `scripts/seed-supabase.ts`.
   - Como configurar vars no Vercel.
8. Atualizar `CLAUDE.md` e `docs/ARCHITECTURE.md` para refletir Supabase.
9. Commit: `feat: phase 6 — institutional pages, NPS, multi-city admin`.
10. PARAR e mostrar resumo.

---

## 12. PARÂMETROS JÁ DEFINIDOS

Não perguntar. Embutir direto:

```env
VITE_SUPABASE_URL=https://ndwbrlsnfiwzxbiptidw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kd2JybHNuZml3enhiaXB0aWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMzg5NTMsImV4cCI6MjA5MzkxNDk1M30.V9bb4NHm_1uFx-eZ5spJWBayD1ecI42ewOYU_e5MAbQ
VITE_WHATSAPP_NUMBER=555180889884
VITE_BRAND_NAME=Vivere
```

- Email admin: `guilherme.buhler@birdie.ai` (criado pelo usuário no Supabase dashboard antes da Fase 4).
- CNPJ: `63.053.609/0001-49`.
- Endereço: R. Sezefredo da Costa Tôrres, 373 · Centro · Santo Antônio da Patrulha · RS · CEP 95500-000.
- Instagram: `@viverealimentos` → `https://instagram.com/viverealimentos`.
- WhatsApp: `(51) 8088-9884` → `https://wa.me/555180889884`.
- Cidades atendidas inicialmente: Santo Antônio da Patrulha (todo dia útil) + Osório (sábado de manhã).

---

## 13. ENTREGA AO FIM DE CADA FASE

Mensagem curta com:
- Lista de arquivos criados/modificados/removidos.
- Como testar a fase manualmente (incluindo qual pré-requisito de dashboard Supabase precisa estar feito).
- O que ficou pendente para a próxima fase.
- Snippet do que o usuário precisa rodar (npm run dev, pré-popular dados, etc.).

Sem relatórios extensos. Sem reescrever este BRIEF.

---

## 14. ROADMAP V3 (não implementar agora — só registrar)

Quando a v2 estiver rodando com clientes reais:

- **Cupom de desconto** (admin gera código, cliente aplica).
- **Pixel Meta + Google Analytics 4** (eventos: começou_montagem, finalizou_cardapio, enviou_whatsapp).
- **Status do pedido visível para o cliente** (link `/pedido/:orderId` mostra "em preparo / pronto / entregue").
- **Link de pagamento integrado** (Stripe / Mercado Pago).
- **App nativo iOS/Android** ou PWA com offline-first.
- **White-label** (multi-tenant: cores, logo, cardápio, regras por marmitaria).
- **Notificação automática** quando atendente marca pedido como pronto (WhatsApp Business API).
- **Dashboard de produção** (agrupa pedidos do dia para a cozinha).
- **RLS reforçada com RPC** para customers/orders (cliente só vê os seus, autenticando via OTP por SMS).
