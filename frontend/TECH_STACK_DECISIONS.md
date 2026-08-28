# Frontend Tech Stack Decisions

This document records the technology choices made for the frontend of this project and the reasoning behind them.

## Build tool: Vite

- Fast dev server (native ESM, no bundling in dev) and fast production builds via Rollup.
- Note: `npm create vite@latest` currently defaults to Vite 8 (rolldown-vite), which threw
  `Cannot find native binding` errors on this machine. Pinned to `vite@^5.4.11` +
  `@vitejs/plugin-react@^4.3.4` instead, which installs and runs cleanly.

## Language: TypeScript (strict mode)

- Matches the backend, enables end-to-end type safety via the generated OpenAPI types.
- Pinned to `typescript@^5.5.3` because `openapi-typescript@7.x` requires TS `^5.x` as a peer
  dependency (the scaffolded project defaulted to TS 6, which is incompatible).
- `strict: true` is required in `tsconfig.app.json` for TanStack Router's type inference to work
  correctly (`strictNullChecks` specifically).

## Routing: TanStack Router (not React Router)

- We already depend on several TanStack libraries (Query, Virtual), so using TanStack Router keeps
  the ecosystem/API style consistent instead of mixing router paradigms.
- First-class, type-safe search params via Zod validation — important here since shipment selection
  and search text are both modeled as URL search params (`?selected=...&search=...`), not component
  state, so state is shareable/bookmarkable and survives refresh.
- Code-based route definitions (not file-based) since the route tree is small (`/` shipments,
  `/assignments` placeholder).

## Server state: TanStack Query

- Handles caching, deduping, background refetching, and mutation/invalidation wiring for all API
  calls. Query keys are centralized in `src/constants/queryKeys.ts` as a factory to avoid
  key-shape mismatches between fetching and invalidating.

## Large list rendering: TanStack Virtual + infinite scroll

- The exercise calls out shipment volumes that could reach 100k+ rows. Rendering all rows (even
  grouped by status) would be too slow/memory-heavy.
- Combined approach: each status group (`OPEN` / `IN_TRANSIT` / `DELIVERED`) paginates
  independently via `useInfiniteShipments` (page size 50, fetch-next-page near scroll end), and the
  currently-loaded rows within a group are virtualized with TanStack Virtual so the DOM only ever
  holds the visible rows plus overscan.

## Forms & validation: React Hook Form + Zod

- `@hookform/resolvers/zod` bridges the two. Used for the shipment edit form
  (delivery date / lat / lng) and the create-shipment modal.
- Zod schemas here are separate from (but shaped like) the backend's Zod schemas — kept minimal on
  the frontend, only covering the specific fields being edited/created in a given form.

## Styling: Tailwind CSS v3 (not v4)

- v4 was initially installed by mistake; deliberately downgraded to v3.4.19 for stability — v4's
  tooling (new engine, no PostCSS config by default) was still new enough that v3 was preferred for
  this exercise's time-boxed scope.

## Map: Leaflet + react-leaflet

- Lightweight, no API key required (uses OpenStreetMap tiles), sufficient for showing a single pin
  per shipment's lat/lng. Requires a small manual fix for marker icon asset paths under Vite's
  bundling (a well-known react-leaflet + Vite compatibility workaround).

## API types: OpenAPI + codegen (not a shared monorepo package)

Two options were considered for keeping frontend and backend types in sync:

- **Option A (chosen): OpenAPI spec + codegen.** The backend generates an OpenAPI document from its
  Zod schemas (`@asteasolutions/zod-to-openapi`), served at `/docs/json` (Swagger UI at `/docs`).
  The frontend runs `npm run gen-api` (`openapi-typescript`) against that endpoint to produce
  `src/api/schema.d.ts`, and `openapi-fetch` provides a fully-typed HTTP client from those types.
- **Option B (rejected): shared package in a monorepo**, with both frontend and backend importing
  types from a common workspace package.

Chosen Option A because the backend is a small, mostly-static addition for this exercise (not
expected to change much going forward), so the one-way codegen step is simpler than setting up
monorepo tooling (workspaces, build ordering) for a shared package that would rarely change.

## Package versions pinned for compatibility

| Package | Version | Reason |
|---|---|---|
| `vite` | `^5.4.11` | v8 (rolldown-vite) had native binding errors on this machine |
| `@vitejs/plugin-react` | `^4.3.4` | matches Vite 5 |
| `typescript` | `^5.5.3` | `openapi-typescript` requires TS `^5.x`, not v6 |
| `tailwindcss` | `^3.4.19` | v4 deliberately avoided for stability in this exercise's timeframe |
| `@asteasolutions/zod-to-openapi` (backend) | `^7` | v9 requires Zod v4; project uses Zod v3 |

## Environment

- Node `v24.15.0` (via `nvm use 24.15.0`) — resolves `EBADENGINE` warnings seen with the default
  Node v22.8.0 for some of the above packages.
