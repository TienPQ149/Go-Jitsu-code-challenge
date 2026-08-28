# Frontend Engineering Take-Home Exercise — Shipment Management UI

> Source: `FE-Candidate-Exercise (1).pdf` (Jitsu, 2026)

## Purpose

This exercise evaluates your ability to build a React application that handles:
- List/detail layouts
- State management
- Data filtering
- Business rule enforcement (status transitions)

Focus of evaluation: **component design, state management decisions, and UI engineering judgment** — not just whether the features work.

**Duration:** 7 calendar days (wall-clock time, not expected effort). Core requirements are estimated to take 4-8 hours of focused work.

---

## Business Context

Jitsu coordinates last-mile package delivery:
A `Shipment` arrives at a warehouse → gets assigned to a delivery route (`Assignment`) → is delivered by a driver.

### Domain Model

#### Shipment
| Field | Type | Notes |
|---|---|---|
| id | string | e.g. `"shp_003"` |
| client_name | string | |
| label | string | e.g. `"LAX-581-250521-6"` |
| status | string | `OPEN` \| `IN_TRANSIT` \| `DELIVERED` |
| arrival_date | datetime | when the shipment arrived at the warehouse |
| delivery_by_date | datetime | delivery deadline |
| eta | datetime | estimated delivery time |
| warehouse_id | string | |
| assignment_id | string? | null if `OPEN` |
| lat / lng | number | delivery location coordinates |

**Status lifecycle (only the following transitions are valid):**
- `OPEN → IN_TRANSIT`: an `assignment_id` must be set
- `IN_TRANSIT → DELIVERED`: the driver has completed the delivery
- `IN_TRANSIT → OPEN`: the shipment is unassigned (reverted); `assignment_id` must be cleared
- ❌ Other transitions (e.g. `OPEN → DELIVERED`, `DELIVERED → OPEN`) are **not valid**

#### Assignment
| Field | Type | Notes |
|---|---|---|
| id | string | e.g. `"as_002"` |
| label | string | e.g. `"TX-127"` |
| status | string | `OPEN` \| `COMPLETED` |
| clients | string[] | client names associated with this assignment |
| shipment_count | number | number of shipments in this assignment |

---

## Requirements (3 tiers)

### 🟢 Core — expected from all candidates

**Shipment List Page (two panels):**

Left Panel — Shipment List:
- Display shipments grouped by status (`OPEN`, `IN_TRANSIT`, `DELIVERED`)
- Each row shows: client name, label, arrival date
- Shipments are clickable to view details in the right panel
- Include a search input that filters shipments by label or client name
- Handle a huge number of shipments (sometimes over 100k shipments per day) → performance/virtualization matters

Right Panel — Shipment Detail:
- Display all shipment fields: `client_name`, `label`, `status`, `arrival_date`, `delivery_by_date`, `warehouse_id`, `assignment_id`
- Editable fields: `delivery_by_date`, `lat`, `lng`
- A save action that persists changes via API call

### 🟡 Stretch — expected from senior candidates; encouraged for mid-level

**Status Transitions:**
- Add a status dropdown to the shipment detail panel
- Enforce valid transitions (see lifecycle above)
- Prevent invalid transitions
- Display only valid target statuses in the dropdown

**Map:**
- In the shipment detail panel, display a map showing the selected shipment's location pin
- You may use any map library (Leaflet, Mapbox, Google Maps, etc.)

**CRUD:**
- Allow inserting new shipments (with sensible defaults)
- Allow deleting shipments

### 🔵 Extra Credit — demonstrates advanced judgment; not required at any level

**Assignment Page (with routing), three panels:**
1. Panel 1 — Assignment List: display assignments grouped by status, searchable by label
2. Panel 2 — Assignment Detail: show assignment details and list of shipments in the assignment
3. Panel 3 — Shipment Detail: clicking a shipment within an assignment shows its detail

- The map in this view should show all shipments in the assignment connected by lines, centered on the selected shipment
- Allow creating new assignments
- Allow deleting empty assignments

---

## Sample Data

A data generation script (`generated-data.js`) creates 100 sample shipments (JSON). Use the generated file as mock data, or serve it via `json-server` for a more realistic API experience.

```bash
npm install -g json-server
json-server --watch shipments.json --port 3001

# Available endpoints:
# GET    /shipments?_page=1&_per_page=25
# GET    /shipments/:id
# PUT    /shipments/:id
# POST   /shipments
# DELETE /shipments/:id
# GET    /statuses
```

---

## Deliverable

Push your project to a public GitHub repository. Your submission should include:

1. A working React application implementing at minimum the Core requirements
2. A `README.md` that explains: prerequisites, how to install dependencies, how to run the application, and a brief description of your approach and any tradeoffs you made
3. A short video recording (2-5 minutes) demonstrating the application — walk through the features you implemented and briefly explain one or two design decisions

If something is ambiguous, make a reasonable assumption, document it in your README, and proceed.

## How Submissions Are Reviewed

A well-designed Core implementation is better than a rushed attempt at everything. Engineering judgment is valued over feature completeness. Reviewers look at how you:

- Structure your components and manage state
- Handle the data flow between list, detail, and edit views
- Enforce business rules (status transitions, assignment requirements)
- Make the UI usable and responsive to user actions
- Organize your code for readability and maintainability
- Document your decisions

## Assumptions You May Make

- Use the provided data generator or serve via `json-server` — you do not need to build a real backend
- You may use any React-compatible libraries (routing, state management, UI components, map libraries) — your choices are part of what is evaluated
- TypeScript is preferred but not required
- Visual polish is appreciated but not the primary evaluation criterion — a functional, well-structured application with basic styling is fine
- You do not need to implement authentication or user management

## Notes for Candidates

- Using LLMs or other AI tools to help with this exercise is fine, but you should be able to explain every design decision in your code during the follow-up conversation
- The video walkthrough and live discussion are where your understanding is evaluated
- A clear, well-reasoned solution for the Core tier is better than an exhaustive solution you cannot explain
- No prior experience with Jitsu or the logistics industry is required
