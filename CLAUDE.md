# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation

Strategic and architectural docs are in `/docs`:
- `docs/PROJECT_VISION.md` — produto, fases, modelo de negócio, métricas
- `docs/DISCOVERY.md` — domínio, glossário, entidades, regras de negócio, edge cases
- `docs/MVP_SCOPE.md` — features priorizadas, user stories, template WhatsApp
- `docs/ARCHITECTURE.md` — estrutura de pastas, camadas, pricing engine, roadmap técnico

**Read these before touching domain logic or pricing.** The domain model, invariants, and extension points are defined there.

## Commands

```bash
npm run dev        # start dev server with HMR
npm run build      # type-check then build for production (tsc -b && vite build)
npm run lint       # run ESLint
npm run preview    # preview production build locally
```

There is no test suite configured yet.

## Stack

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin — no `tailwind.config.js`, configured entirely in `src/index.css` with `@theme inline`)
- **shadcn/ui** (`radix-nova` style, `radix-ui` primitives) — components live in `src/components/ui/`
- **Geist Variable** as the default sans-serif font (imported from `@fontsource-variable/geist`)
- Path alias `@/` resolves to `src/`

## Architecture

This is an early-stage single-page app with minimal structure. `src/App.tsx` is the root component rendered by `src/main.tsx`.

### Styling conventions

- CSS design tokens (colors, radius, sidebar, charts) are defined as CSS custom properties in `src/index.css` under `:root` (light) and `.dark` (dark mode). Dark mode is activated by the `.dark` class on an ancestor element.
- Tailwind utility classes consume these tokens via the `@theme inline` block at the top of `src/index.css`.
- Use `cn()` from `@/lib/utils` (wraps `clsx` + `tailwind-merge`) for conditional class merging.

### Adding shadcn components

Run `npx shadcn add <component>` — components are scaffolded into `src/components/ui/` and can be edited freely. The `components.json` config uses aliases `@/components`, `@/lib`, `@/hooks`.
