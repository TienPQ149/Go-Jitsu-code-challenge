import type { components } from "../api/schema";

/**
 * Re-exported from the generated OpenAPI schema (single source of truth
 * shared with the backend). Import these instead of redefining shapes.
 */
export type Shipment = components["schemas"]["Shipment"];
export type Assignment = components["schemas"]["Assignment"];
export type ShipmentStatus = Shipment["status"];
export type AssignmentStatus = Assignment["status"];
