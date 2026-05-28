# VIRALOS AI

An Autonomous Viral Content Operating System — users enter a single prompt and the AI pipeline generates a viral short-form video ready to export for YouTube Shorts, TikTok, Reels, and X clips.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/viralos run dev` — run the frontend (auto port via $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — build composite libs only
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — auto-provisioned by Clerk Auth setup

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind v4 + Framer Motion + Recharts
- API: Express 5 + Clerk auth (`@clerk/express`)
- DB: PostgreSQL + Drizzle ORM
- Auth: Replit-managed Clerk (`@clerk/react` v6, `Show` component, not `SignedIn`/`SignedOut`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → `lib/api-zod`, `lib/api-client-react`)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — all Drizzle ORM table definitions (source of truth for DB)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-zod/src/generated/` — Zod schemas generated from OpenAPI
- `lib/api-client-react/src/generated/` — React Query hooks generated from OpenAPI
- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/viralos/src/pages/` — all frontend pages
- `artifacts/viralos/src/components/Layout.tsx` — sidebar nav layout
- `artifacts/viralos/src/index.css` — theme (dark matte-black + electric blue)

## Architecture decisions

- Contract-first API: OpenAPI spec → codegen → Zod schemas + React Query hooks. Never write API client code by hand.
- Clerk v6 uses `Show` component with `when="signed-in"` / `when="signed-out"`, not `SignedIn`/`SignedOut` components.
- Clerk proxy is production-only (`/api/__clerk`). In dev, `VITE_CLERK_PROXY_URL` is empty and Clerk connects directly to dev FAPI. Never hardcode the proxy URL.
- `publishableKeyFromHost` from `@clerk/react/internal` resolves the key — never pass the raw env var directly.
- DB schema push: always run `pnpm --filter @workspace/db run push` after schema changes in dev.
- Pipeline simulation: all AI generation steps (script, voice, clips, render, export) are simulated server-side. Real API keys (ElevenLabs, Pexels, RunwayML etc.) can be wired in Settings page.

## Product

- **Dashboard**: stats overview, recent projects, platform breakdown chart
- **Create Video**: 6-step pipeline wizard (Prompt → Script → Voice → Clips → Render → Export)
- **Projects**: filterable list with status indicators and delete
- **Project Detail**: full pipeline view per project with all stage data
- **Analytics**: charts for platform breakdown and success rates
- **Trend Radar**: 20 seeded trending topics, filterable by platform/category
- **Settings**: API key configuration for ElevenLabs, Pexels, Pixabay, RunwayML, AssemblyAI, OpenAI

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/db run push` after any schema changes, or the server will crash on missing columns.
- Clerk v6 `@clerk/react` does NOT export `SignedIn`/`SignedOut` — use `Show` with `when` prop.
- Framer Motion `ease` property in variants must use typed `Easing` values, not arbitrary strings. Use `transition: { duration: X }` without `ease` or use `"easeOut"` as a const cast.
- `@workspace/api-zod` can be imported in the frontend via `workspace:*` in package.json devDependencies, or use `@workspace/api-client-react` which re-exports everything from `api.schemas.ts`.
- Trends seed data is in the DB from initial setup. Re-run the seed SQL if the DB is reset.
- The Clerk app name shown on the sign-in page ("Node Explorer" vs "VIRALOS AI") is controlled from the Replit Auth pane — not from code.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `.local/skills/clerk-auth/references/setup-and-customization.md` for Clerk wiring patterns
