# PROJECT_VISION.md — VIVERE Personalizadas

## 1. Identidade do Produto

**VIVERE Personalizadas** é uma plataforma premium de marmitas personalizadas. O diferencial central não é a marmita — é a **personalização de alta fidelidade**: o cliente monta sua refeição com ingredientes e gramatura de sua escolha, e o sistema reflete o custo real em tempo real.

A plataforma resolve o paradoxo operacional das marmitarias premium: *personalização é o principal atrativo, mas é manualmente inviável na escala.*

---

## 2. Problema Atual

### 2.1 Fluxo Problemático (hoje)
```
Cliente → WhatsApp → Atendente interpreta → Calcula preço na memória/planilha
→ Confirma → Anota em caderno/planilha → Passa para produção verbalmente
→ Produção pode errar → Entrega com possível divergência
```

### 2.2 Custos do Processo Manual

| Problema | Impacto |
|---|---|
| Interpretação errada de pedido | Retrabalho + desperdício de insumo |
| Cálculo manual de preço | Erro humano, preços inconsistentes |
| Atendimento por mensagem | Latência alta, cliente aguarda resposta |
| Dados não estruturados | Impossível analisar preferências ou planejar estoque |
| Escalabilidade linear | Cada pedido novo = trabalho proporcional |
| Ausência de registro | Sem histórico, sem recorrência automatizada |

### 2.3 Dores Específicas da Vivere
- Pedidos personalizados consomem tempo de atendimento desproporcional
- Precificação inconsistente para ingredientes premium (ex: salmão vs frango)
- Dificuldade em comunicar gramatura ao cliente (expectativa vs entrega)
- Sem dados sobre o que os clientes mais pedem (impossível planejar cardápio)

---

## 3. Solução: VIVERE Platform

### 3.1 Proposta de Valor Central
> O cliente monta sua refeição ideal em 90 segundos, vê o preço justo em tempo real, e envia um pedido estruturado que chega direto na fila de produção — sem atrito, sem erro, sem intermediário.

### 3.2 Fluxo Futuro (com plataforma)
```
Cliente → Meal Builder → Seleciona ingredientes + tamanho
→ Preço calculado automaticamente → Revisa resumo
→ Envia pedido estruturado (WhatsApp ou direto) → Produção recebe ticket formatado
```

---

## 4. Fases do Produto

### Fase 1 — MVP: Builder para a Vivere
**Objetivo:** Substituir o processo WhatsApp por builder digital.
**Escopo:**
- Meal builder com cardápio estático
- Pricing engine com regras configuradas
- Validação de composição (proteína + carboidrato obrigatórios)
- Geração de mensagem estruturada para WhatsApp
- 100% client-side, sem backend

**Critério de sucesso:** Operador recebe pedido via WhatsApp sem precisar editar a mensagem.

---

### Fase 2 — Operacional
**Objetivo:** Dar à equipe da Vivere ferramentas de gestão.
**Escopo:**
- Painel admin: gestão de cardápio (ativar/desativar ingredientes)
- Fila de pedidos em tempo real
- Relatório de produção diária (o que produzir, em que quantidade)
- Autenticação básica para operadores
- Backend com API + banco de dados

---

### Fase 3 — SaaS / White-Label
**Objetivo:** Monetizar a plataforma para outras marmitarias.
**Escopo:**
- Multi-tenant isolado (cada marmitaria tem seu ambiente)
- White-label: cores, logo, domínio customizado por tenant
- Cardápio configurável por tenant
- Pricing rules configuráveis (sem código)
- Onboarding self-service

**Modelo de negócio:**
- Assinatura mensal por tenant (tiers: Starter / Pro / Scale)
- Opcionalmente: % sobre volume de pedidos acima de certo threshold

---

### Fase 4 — IA & Automação
**Objetivo:** Reduzir atrito operacional ao mínimo e gerar inteligência de negócio.
**Escopo:**
- **OCR de cardápio:** fotografa cardápio físico → sistema digitaliza automaticamente
- **Sugestão de refeição:** "Montar igual ao pedido anterior" / "Sugerir por perfil"
- **Previsão de demanda:** ML para planejar produção com antecedência
- **Precificação dinâmica:** ajuste por disponibilidade de ingrediente / demanda por horário

---

## 5. Posicionamento de Mercado

### Mercado Primário
Marmitarias premium e fit que oferecem personalização como diferencial. Ticket médio acima de R$25/marmita. Operação com múltiplos pedidos simultâneos.

### Mercado Secundário (SaaS)
Qualquer negócio de alimentação personalizada: dietas específicas (low carb, vegano), refeições para academias, serviços de meal prep corporativo.

### Diferencial Competitivo da Plataforma
- **Pricing engine alimentar** real (não genérico) — entende gramatura, categorias, ingredientes premium
- **Meal builder UX premium** — experiência fluida, não formulário genérico
- **Operação integrada** — do pedido ao ticket de produção sem fricção
- **Dado estruturado** — cada pedido gera informação de negócio (preferências, estoque)

---

## 6. Métricas de Sucesso por Fase

| Fase | Métrica Principal | Meta |
|---|---|---|
| MVP | Tempo médio de montagem de pedido | < 2 minutos |
| MVP | Taxa de erro em pedidos | 0% (vs. ~5-10% manual) |
| MVP | Adoção pelos clientes Vivere | 70% pedidos via plataforma em 60 dias |
| Operacional | Tempo de preparação de relatório de produção | < 1 minuto (vs. manual) |
| SaaS | MRR após 6 meses | Definir com equipe |
| SaaS | Churn mensal de tenants | < 3% |
