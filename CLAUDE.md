# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation

Strategic and architectural docs are in `/docs`:
- `docs/PROJECT_VISION.md` — produto, fases, modelo de negócio, métricas
- `docs/DISCOVERY.md` — domínio, glossário, entidades, regras de negócio, edge cases
- `docs/MVP_SCOPE.md` — features priorizadas, user stories, template WhatsApp
- `docs/ARCHITECTURE.md` — estrutura de pastas, camadas, pricing engine, roadmap técnico

**Read BRIEF.md (root) for the full product spec including pricing formula and admin panel spec.**
**Read these docs before touching domain logic or pricing.** The domain model, invariants, and extension points are defined there.

## Commands

```bash
npm run dev        # start dev server with HMR
npm run build      # type-check then build for production (tsc -b && vite build)
npm run lint       # run ESLint
npm run preview    # preview production build locally
npm run test       # run Vitest test suite
npm run test:ui    # Vitest with interactive UI
```

## Stack

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin — no `tailwind.config.js`, configured entirely in `src/index.css` with `@theme inline`)
- **shadcn/ui** (`radix-nova` style, `radix-ui` primitives) — components live in `src/components/ui/`
- **Fraunces Variable** (display/headings) + **Geist Variable** (body) — both imported via CSS `@import` in `src/index.css` (not in `main.tsx` — verbatimModuleSyntax would reject side-effect imports in TSX)
- **Zustand 5** — wizard store (`src/features/meal-builder/store/wizardStore.ts`), admin store (`src/features/admin/store/adminStore.ts`)
- **React Router v7** — `BrowserRouter` in `main.tsx`, routes in `App.tsx`: `/` → wizard, `/admin` → admin gate
- **Vitest 4** — tests in `src/__tests__/`
- Path alias `@/` resolves to `src/`

## Architecture

DDD with clean separation: domain → application → infrastructure → features (UI only).

- `src/domain/` — pure types and functions, no dependencies on React/infra
- `src/application/ports/` — repository interfaces (`IngredientRepository`, `OrderRepository`)
- `src/infrastructure/` — localStorage repos, seed JSON, env config, ServiceFactory
- `src/features/` — React components by feature (meal-builder, order, admin, shared)
- `src/__tests__/` — unit tests for pricing engine, composition rules, order pricing

### Key invariants
- Pricing formula lives in `src/domain/pricing/engine.ts` — read BRIEF Section 5 before touching it
- Composition rules (including veg-medley exclusivity) in `src/domain/meal/rules/composition.ts`
- Wizard navigation state in `src/features/meal-builder/store/wizardStore.ts`
- Catalog persisted in `localStorage` key `vivere:catalog`; orders in `vivere:orders`
- Admin password from `VITE_ADMIN_PASSWORD` env var (default: `vivere1213`)

### Styling conventions

- Brand tokens defined in `src/index.css` under `:root`: `--vivere-verde-escuro: #1F4F2E`, `--vivere-verde-vivo: #2DBE4D`, `--vivere-laranja: #F08534`, `--vivere-creme: #FAF6EE`
- Tailwind utilities consume these via `@theme inline` block
- Use `cn()` from `@/lib/utils` for conditional classes
- Shadows: `shadow-card`, `shadow-cta`, warm green-tinted variants
- Motion: `--ease-out-expo: cubic-bezier(0.2, 0.8, 0.2, 1)`, slide animations `animate-step-forward`/`animate-step-back`

### Adding shadcn components

Run `npx shadcn add <component>` — components scaffolded into `src/components/ui/`.
