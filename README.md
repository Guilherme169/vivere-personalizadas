# Vivere Personalizadas

Configurador de marmitas personalizadas sob encomenda. React 19 + TypeScript 6 + Vite 8 + Tailwind v4 + Zustand.

## Pré-requisitos

- Node 20+
- npm 10+

## Comandos

```bash
npm run dev        # inicia servidor de desenvolvimento com HMR
npm run build      # type-check + build de produção
npm run preview    # preview do build de produção
npm run lint       # ESLint
npm run test       # Vitest (suite: pricing, composição, pedido)
npm run test:ui    # Vitest com UI interativa
```

## Variáveis de ambiente

Crie `.env.local` na raiz (não versionar):

```env
VITE_WHATSAPP_NUMBER=555180889884   # número sem + nem espaços
VITE_ADMIN_PASSWORD=vivere1213      # senha do painel /admin
VITE_BRAND_NAME=Vivere              # nome da marca
```

Se não definidas, os defaults acima são usados.

## Painel Admin

Acesse `/admin` no navegador e insira a senha (`VITE_ADMIN_PASSWORD`).

Funcionalidades:
- **Custos Fixos** — embalagem, entrega, outros
- **Operacional** — aluguel, volume, cozinheiros, salário, markup; mostra custos fixos derivados em tempo real
- **Regras do Cliente** — taxa de entrega, limiares de frete grátis e descontos 5%/10%
- **Ingredientes** — CRUD completo com exportar/importar JSON; persiste em `localStorage`
- **Prévia** — mostra formação de preço com a composição-exemplo (150g frango + 100g arroz + 100g brócolis)
- **Pedidos** — auditoria dos pedidos salvos no `localStorage`, exportar JSON, limpar

## Editando o catálogo de ingredientes

O catálogo seed fica em `src/infrastructure/seed/catalog.seed.json`. Este arquivo é a base carregada na primeira visita (ou quando o `localStorage` está vazio). Para sobrescrever o catálogo em produção, use "Exportar JSON" no Admin após editar, versionando o arquivo exportado.

## Arquitetura

Veja `docs/ARCHITECTURE.md` para a estrutura completa de pastas e decisões técnicas.

- `src/domain/` — tipos e lógica pura (sem dependências externas)
- `src/application/` — ports (interfaces de repositório) e use cases
- `src/infrastructure/` — implementações concretas (localStorage, seed, config)
- `src/features/` — componentes React por feature
- `src/__tests__/` — testes Vitest (pricing engine, regras de composição, cálculo de pedido)
