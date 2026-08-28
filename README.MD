
# Jitsu Shipment Management

A shipment management application built for the **Jitsu Vietnam Senior Frontend Engineer technical assessment**.

## Tech Stack

**Frontend**

* React + TypeScript
* TanStack Query / Router / Virtual
* React Hook Form + Zod
* Leaflet
* Vitest + React Testing Library

**Backend**

* Node.js + Express + TypeScript
* Zod
* OpenAPI
* JSON-based persistence

## Features

* Shipment listing, search and grouping
* Shipment detail and editing
* Status transitions and assignment management
* Create / delete shipments
* Map visualization
* Large dataset handling with infinite loading + virtualization
* Form validation and API error handling
* Automated tests

## Project Structure

```text
.
├── frontend/        # React application
└── backend/         # Express API
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

For detailed setup instructions:

* [Frontend README](./frontend/README.md)
* [Backend README](./backend/README.md)

## Notes

The assessment primarily focuses on the frontend. I also implemented the backend as an additional exercise to explore backend development, as discussed during the recruitment process.

Key architectural decisions and implementation details are documented in the respective frontend and backend READMEs.
