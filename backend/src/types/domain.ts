// Re-exported from the Zod schemas (src/schemas/domain.schema.ts, shipment.schema.ts,
// assignment.schema.ts) so there is a single source of truth for these shapes,
// which also drives the generated OpenAPI spec consumed by the frontend.
export type { ShipmentStatus } from "../schemas/shipment.schema";
export type { AssignmentStatus } from "../schemas/assignment.schema";
export type { Shipment, Assignment } from "../schemas/domain.schema";

