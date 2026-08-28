import "../openapi/registry";
import { z } from "zod";
import { shipmentStatusSchema } from "./shipment.schema";
import { assignmentStatusSchema } from "./assignment.schema";

/**
 * These schemas are the single source of truth for the Shipment/Assignment
 * shapes returned by the API. They back both:
 *  - the OpenAPI spec served at /docs/json (consumed by the frontend's
 *    `gen-api` script to generate TypeScript types), and
 *  - the internal `Shipment`/`Assignment` TS types used across the backend
 *    (see src/types/domain.ts, which just re-exports the inferred types).
 */
export const shipmentSchema = z
  .object({
    id: z.string().openapi({ example: "shp_003" }),
    client_name: z.string(),
    label: z.string().openapi({ example: "LAX-581-250521-6" }),
    status: shipmentStatusSchema,
    arrival_date: z.string().datetime(),
    delivery_by_date: z.string().datetime(),
    eta: z.string().datetime(),
    warehouse_id: z.string(),
    assignment_id: z.string().nullable(),
    lat: z.number(),
    lng: z.number(),
  })
  .openapi("Shipment");

export const assignmentSchema = z
  .object({
    id: z.string().openapi({ example: "as_002" }),
    label: z.string().openapi({ example: "TX-127" }),
    status: assignmentStatusSchema,
    clients: z.array(z.string()),
    shipment_count: z.number(),
  })
  .openapi("Assignment");

export type Shipment = z.infer<typeof shipmentSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;
