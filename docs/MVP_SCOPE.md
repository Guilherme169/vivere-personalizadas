# MVP_SCOPE.md — Escopo do MVP

## 1. Objetivo

Substituir o processo de pedidos via WhatsApp por um builder digital que:
1. Elimina erros de interpretação de pedido
2. Calcula preço automaticamente com breakdown visível
3. Gera mensagem estruturada para o operador sem edição manual

**Prazo conceitual:** produto validável em produção, não polished product.
**Stack:** 100% client-side. Sem backend. Sem autenticação. Sem banco de dados.

---

## 2. Features (MoSCoW)

### Must Have — MVP não existe sem isso

| ID | Feature | Descrição |
|---|---|---|
| F-01 | Seleção de tamanho | Cliente escolhe P/M/G/GG; sistema exibe preço base e gramatura total |
| F-02 | Seleção de ingredientes | Por categoria, com ingredientes disponíveis do cardápio |
| F-03 | Validação em tempo real | Composição obrigatória (proteína, carb, legume) validada a cada mudança |
| F-04 | Gramatura visual | Indicador de quanto do container já foi preenchido |
| F-05 | Pricing em tempo real | Preço calculado e detalhado a cada mudança de composição |
| F-06 | Resumo do pedido | Tela de revisão antes de enviar |
| F-07 | Geração de mensagem WhatsApp | Botão gera link `wa.me` com mensagem pré-formatada |
| F-08 | Campo de observações | Texto livre (sem impacto no preço) |
| F-09 | Cardápio configurável | Ingredientes e preços definidos em arquivo de configuração (não hardcoded) |

### Should Have — próximas iterações pós-validação

| ID | Feature | Descrição |
|---|---|---|
| F-10 | Múltiplas marmitas por pedido | Cliente adiciona 2ª marmita com composição diferente |
| F-11 | Identificação do cliente | Nome + telefone para o ticket |
| F-12 | Persistência em localStorage | Recupera pedido em andamento ao reabrir a página |

### Could Have — nice to have

| ID | Feature | Descrição |
|---|---|---|
| F-13 | Marmita favorita | Salva composição e reutiliza |
| F-14 | Preview do ticket de produção | Mostra como o operador vai receber o pedido |

### Won't Have (MVP)

- Autenticação / login de cliente
- Pagamento online
- Painel admin de cardápio (cardápio em JSON estático)
- Histórico de pedidos
- Multi-empresa / multi-tenant
- Backend / banco de dados
- Push notifications
- Sugestões automáticas / IA

---

## 3. User Stories

### US-01 — Seleção de Tamanho
> Como cliente, quero selecionar o tamanho da minha marmita para definir a capacidade e o preço base.

**Acceptance Criteria:**
- [ ] Ao carregar a página, os 4 tamanhos são exibidos com nome, gramatura total e preço base
- [ ] Selecionar um tamanho destaca-o visualmente e atualiza o preço exibido
- [ ] É impossível prosseguir sem selecionar um tamanho
- [ ] Trocar o tamanho reseta a composição com confirmação ("trocar tamanho vai limpar sua marmita")

---

### US-02 — Montagem de Composição
> Como cliente, quero escolher meus ingredientes por categoria para montar a refeição que quero.

**Acceptance Criteria:**
- [ ] Ingredientes exibidos agrupados por categoria
- [ ] Ingredientes não disponíveis aparecem desabilitados (não somem)
- [ ] Proteína: seleção de 1 obrigatória; opção de adicionar 2ª porção (cobrada)
- [ ] Carboidrato: seleção de 1 obrigatória; pode trocar (mas não duplicar)
- [ ] Legumes: múltipla seleção; preenchimento visual da gramatura restante
- [ ] Feijão: toggle on/off; gramatura fixa deduzida ao ativar
- [ ] Salada e molhos: múltipla seleção; sem impacto em gramatura ou preço

---

### US-03 — Validação e Feedback em Tempo Real
> Como cliente, quero saber imediatamente quando minha marmita está incompleta ou inválida.

**Acceptance Criteria:**
- [ ] Erros de composição exibidos de forma não-intrusiva (não modal)
- [ ] Botão de avançar desabilitado enquanto houver erros de validação
- [ ] Mensagem clara para cada erro: "Adicione uma proteína", "Adicione um carboidrato"
- [ ] Indicador de gramatura mostra visualmente o preenchimento (barra de progresso)
- [ ] Quando gramatura atinge 100%, novos legumes são bloqueados com feedback

---

### US-04 — Precificação Transparente
> Como cliente, quero ver o preço total atualizado a cada mudança, com detalhamento do que gera custo.

**Acceptance Criteria:**
- [ ] Preço total atualiza em tempo real (sem latência perceptível)
- [ ] Breakdown acessível: preço base + cada surcharge/adicional discriminado
- [ ] Ingredientes premium têm indicação visual (ícone, label ou cor diferente)
- [ ] Breakdown não precisa estar sempre visível (pode ser expandível)

---

### US-05 — Revisão do Pedido
> Como cliente, quero revisar meu pedido completo antes de enviar para confirmar que está correto.

**Acceptance Criteria:**
- [ ] Tela de resumo lista todos os ingredientes agrupados por categoria
- [ ] Exibe gramaturas de cada item
- [ ] Exibe breakdown de preço e total
- [ ] Exibe campo para nome e observações
- [ ] Botão de voltar e editar disponível

---

### US-06 — Envio via WhatsApp
> Como cliente, quero enviar meu pedido com um clique gerando uma mensagem já formatada no WhatsApp.

**Acceptance Criteria:**
- [ ] Botão único de "Enviar Pedido"
- [ ] Abre WhatsApp (app ou web) com mensagem pré-preenchida
- [ ] Mensagem contém: nome do cliente, tamanho, todos os ingredientes com gramatura, preço total, observações
- [ ] Mensagem é legível por humano sem o app (o operador entende sem ver a UI)
- [ ] Funciona no mobile (link `wa.me`) e desktop (WhatsApp Web)

---

### US-07 — Operador recebe ticket estruturado
> Como operador da cozinha, quero receber um pedido formatado que posso executar sem perguntas.

**Acceptance Criteria:**
- [ ] Mensagem segue template fixo definido pela Vivere
- [ ] Conteúdo: nome, data/hora, tamanho, composição na ordem de montagem, observações, preço
- [ ] Não requer interpretação — cada ingrediente com gramatura explícita

---

## 4. Template da Mensagem WhatsApp

```
🍱 *PEDIDO VIVERE PERSONALIZADAS*
────────────────────────
👤 *Cliente:* [nome]
📅 [data] às [hora]

📦 *Tamanho:* [P/M/G/GG] — [gramatura total]g

🥩 *Proteína:* [nome] ([gramatura]g)
🍚 *Carboidrato:* [nome] ([gramatura]g)
🫘 *Feijão:* [Sim — 60g / Não]
🥦 *Legumes:* [lista separada por vírgula]
🥗 *Salada:* [lista ou "Não"]
🫙 *Molho:* [lista ou "Não"]
➕ *Adicionais:* [lista ou "Nenhum"]

📝 *Observações:* [texto livre ou "Nenhuma"]

💰 *Total:* R$ [valor]
────────────────────────
```

---

## 5. Cardápio Inicial (JSON Estático)

O cardápio do MVP é definido em `src/infrastructure/config/menu.config.ts`.
Não há interface admin — edição manual do arquivo.

Estrutura mínima a implementar:
```typescript
// Exemplo de entrada no cardápio
{
  id: 'frango-grelhado',
  name: 'Frango Grelhado',
  category: IngredientCategory.PROTEIN,
  unitGramatura: 150,      // por porção padrão
  basePrice: money(0),     // incluso no preço base
  isPremium: false,
  isAvailable: true,
  allergens: [],
  tags: []
}
```

---

## 6. Definição de "Pronto" (Definition of Done)

Uma feature é considerada pronta quando:
- [ ] Funciona corretamente no Chrome mobile (375px)
- [ ] Funciona corretamente no Chrome desktop
- [ ] Lógica de domínio (pricing, validação) tem testes unitários
- [ ] Não há erros de TypeScript
- [ ] Lint passa sem warnings

---

## 7. Critérios de Sucesso do MVP

| Critério | Métrica |
|---|---|
| Velocidade de montagem | Pedido completo em < 2 minutos |
| Precisão de preço | 0 erros de cálculo (automático = sem erro humano) |
| Usabilidade mobile | 100% das features operáveis em 375px |
| Qualidade do ticket | Operador não precisa editar a mensagem recebida |
| Adoção | Vivere usa como canal principal em 30 dias |
