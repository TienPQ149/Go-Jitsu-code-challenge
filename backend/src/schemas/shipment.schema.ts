import { z } from "zod";

export const shipmentStatusSchema = z.enum(["OPEN", "IN_TRANSIT", "DELIVERED"]);
export type ShipmentStatus = z.infer<typeof shipmentStatusSchema>;

/** Fields required when creating a shipment. Missing fields fall back to sensible defaults in the service layer. */
export const createShipmentSchema = z.object({
  client_name: z.string().min(1, "client_name is required"),
  label: z.string().min(1, "label is required"),
  status: shipmentStatusSchema.optional(),
  arrival_date: z.string().datetime().optional(),
  delivery_by_date: z.string().datetime().optional(),
  eta: z.string().datetime().optional(),
  warehouse_id: z.string().optional(),
  assignment_id: z.string().nullable().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

/** Only the fields the exercise explicitly allows editing from the detail panel. */
export const updateShipmentSchema = z
  .object({
    delivery_by_date: z.string().datetime().optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one editable field (delivery_by_date, lat, lng) must be provided",
  });

/** Dedicated payload for status transitions, since it carries its own business rules. */
export const transitionShipmentStatusSchema = z.object({
  status: shipmentStatusSchema,
  assignment_id: z.string().nullable().optional(),
});

export const listShipmentsQuerySchema = z.object({
  status: shipmentStatusSchema.optional(),
  search: z.string().optional(),
  _page: z.coerce.number().int().min(1).optional(),
  _per_page: z.coerce.number().int().min(1).max(500).optional(),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>;
export type TransitionShipmentStatusInput = z.infer<typeof transitionShipmentStatusSchema>;
export type ListShipmentsQuery = z.infer<typeof listShipmentsQuerySchema>;
