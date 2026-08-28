# GoJitsu Frontend

A React + TypeScript SPA for the Shipment Management exercise: a virtualized, searchable,
status-grouped shipment list with an editable detail panel, status transitions, a location map,
and create/delete flows.

## Stack

- **Vite** + **React 19** + **TypeScript** (strict mode)
- **TanStack Router** — code-based routing with Zod-validated URL search params (selected shipment,
  search term)
- **TanStack Query** — server state, caching, mutations
- **TanStack Virtual** — virtualizes each status group's shipment list (built for 100k+ rows)
- **React Hook Form** + **Zod** — forms (create/edit shipment)
- **Tailwind CSS v3** — styling
- **Leaflet** + **react-leaflet** — shipment location map
- **openapi-typescript** + **openapi-fetch** — typed API client generated from the backend's
  OpenAPI spec (single source of truth for request/response shapes)
- **Vitest** + **React Testing Library** — unit/component tests

See `TECH_STACK_DECISIONS.md` for the reasoning behind each choice.

## Prerequisites

- Node.js 20+ (project developed/tested on v24.15.0 via `nvm`)
- The backend running locally (see `backend/README.md`) — required both to use the app and to
  regenerate API types

## Install & Run

```bash
cd frontend
npm install
cp .env.example .env   # sets VITE_API_BASE_URL=http://localhost:3001
npm run dev            # starts the app on http://localhost:5173
```

Other scripts:

```bash
npm run build           # typecheck (tsc -b) + production build to dist/
npm run preview         # preview the production build locally
npm run lint            # ESLint

npm run gen-api         # regenerate src/api/schema.d.ts from the running backend's OpenAPI spec
                         # (backend must be running on http://localhost:3001)

npm run test            # run all tests once
npm run test:watch      # run tests in watch mode
npm run test:coverage   # run tests with a coverage report (text + html in coverage/)
```

## Project Structure

```
src/
  api/            # apiClient (openapi-fetch) + typed request functions per resource
  components/     # UI components (shipments/, map/)
  constants/      # queryKeys factory (TanStack Query cache keys)
  hooks/          # TanStack Query hooks (queries, mutations, infinite scroll, debounce)
  pages/          # Top-level page components
  routes/         # TanStack Router route definitions
  types/          # Domain types re-exported from the generated OpenAPI schema
  test/           # Test setup + shared test utilities
```

