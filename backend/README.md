# GoJitsu Backend

A small Express + TypeScript API backing the Shipment Management exercise. It replaces `json-server`
with a hand-rolled service that also **enforces the shipment status transition business rules**
server-side (not just in the frontend), and keeps assignment `shipment_count`/`clients` in sync.

> Built primarily to practice backend fundamentals (Express routing, layered architecture, Zod
> validation). The exercise itself only requires a mock API — this is optional but documented here
> for transparency.

## Stack

- **Express** — HTTP server / routing
- **TypeScript** — strict mode
- **Zod** — request validation (body & query params)
- **tsx** — fast dev runner (no separate build step needed during development)
- Plain JSON files as the "database" (`data/shipments.json`, `data/assignments.json`)

## Project Structure

```
src/
  types/domain.ts            # Shipment / Assignment interfaces
  schemas/                    # Zod schemas (create/update/transition/query)
  repositories/                # JsonFileStore: generic load/persist to a JSON file
  services/                    # Business logic (status transitions, assignment sync)
  routes/                      # Express routers per resource
  middleware/                  # validate() (Zod) + centralized errorHandler
  utils/                       # AppError, asyncHandler, statusTransitions rules
  scripts/generate-data.ts     # Seeds data/shipments.json + data/assignments.json
  app.ts                       # createApp() — wires everything together
  index.ts                     # entrypoint, starts the HTTP server
```

## Prerequisites

- Node.js 18+
- npm

## Install & Run

```bash
cd backend
npm install
npm run generate-data   # seeds data/shipments.json and data/assignments.json
npm run dev             # starts the API on http://localhost:3001 (watch mode)
```

Other scripts:

```bash
npm run build   # compile to dist/
npm start       # run compiled output (dist/index.js)
```

The server listens on `PORT` env var if set, otherwise `3001`.

## API Endpoints

### Shipments

| Method | Path | Description |
|---|---|---|
| GET | `/shipments?status=&search=&_page=&_per_page=` | List shipments, optional status filter, search by label/client, pagination |
| GET | `/shipments/:id` | Get one shipment |
| GET | `/shipments/:id/valid-transitions` | Valid target statuses for the FE dropdown |
| POST | `/shipments` | Create shipment (sensible defaults applied) |
| PUT | `/shipments/:id` | Update editable fields only: `delivery_by_date`, `lat`, `lng` |
| PATCH | `/shipments/:id/status` | Transition status; body `{ status, assignment_id? }` |
| DELETE | `/shipments/:id` | Delete shipment |

### Assignments

| Method | Path | Description |
|---|---|---|
| GET | `/assignments?status=&search=` | List assignments |
| GET | `/assignments/:id` | Get one assignment |
| GET | `/assignments/:id/shipments` | List shipments belonging to an assignment |
| POST | `/assignments` | Create assignment |
| DELETE | `/assignments/:id` | Delete assignment (only if `shipment_count === 0`) |

### Misc

| Method | Path | Description |
|---|---|---|
| GET | `/statuses` | `[{ id: "OPEN" }, { id: "IN_TRANSIT" }, { id: "DELIVERED" }]` |
| GET | `/health` | Health check |

## Business Rules Enforced

Status transitions (`PATCH /shipments/:id/status`):

- `OPEN → IN_TRANSIT`: requires a valid, existing `assignment_id` in the request body
- `IN_TRANSIT → DELIVERED`: allowed, keeps existing `assignment_id`
- `IN_TRANSIT → OPEN`: allowed, `assignment_id` is force-cleared to `null`
- Any other transition (including same-status, or transitioning out of `DELIVERED`) → `400 Bad Request`

After every shipment create/update/delete/transition that touches `assignment_id`, the affected
assignment(s)' `shipment_count` and `clients` are recomputed from the current shipment list, so
these derived fields never drift out of sync.

Deleting an assignment is blocked (`409 Conflict`) unless it has zero shipments.

## Design Decisions & Tradeoffs

- **JSON file store instead of a real DB**: simplest thing that supports full CRUD + persistence
  without adding infra. Not safe for concurrent writers, but fine for a single local dev server.
- **Separate `PUT` (editable fields) vs `PATCH .../status` (status transition)**: the spec draws a
  clear line between "freely editable fields" and "status change with business rules" — modeling them
  as two endpoints with two Zod schemas keeps each one's validation focused and prevents accidentally
  allowing a client to bypass transition rules via a generic update.
- **`asyncHandler` wrapper**: Express 4 doesn't forward synchronous throws or rejected promises from
  route handlers to error middleware automatically, so every handler is wrapped to guarantee errors
  reach the centralized `errorHandler`.
- **Zod for both body and query validation**: query strings arrive as strings, so schemas use
  `z.coerce.number()` for pagination params to convert them safely.
