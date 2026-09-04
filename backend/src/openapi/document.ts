import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registry } from "./registry";
import { shipmentSchema, assignmentSchema } from "../schemas/domain.schema";
import {
  createShipmentSchema,
  listShipmentsQuerySchema,
  transitionShipmentStatusSchema,
  updateShipmentSchema,
  shipmentStatusSchema,
} from "../schemas/shipment.schema";
import {
  assignmentStatusSchema,
  createAssignmentSchema,
  listAssignmentsQuerySchema,
} from "../schemas/assignment.schema";

const idParam = z.object({ id: z.string().openapi({ example: "shp_003" }) });

const errorResponseSchema = z
  .object({
    error: z.string(),
    details: z.unknown().optional(),
  })
  .openapi("ErrorResponse");

const jsonBody = (schema: z.ZodTypeAny) => ({
  content: { "application/json": { schema } },
});

const errorResponses = {
  400: { description: "Validation error", ...jsonBody(errorResponseSchema) },
  404: { description: "Not found", ...jsonBody(errorResponseSchema) },
  409: { description: "Conflict", ...jsonBody(errorResponseSchema) },
};

// ---- Shipments ----

registry.registerPath({
  method: "get",
  path: "/shipments",
  tags: ["Shipments"],
  summary: "List shipments (filter by status/search, paginate)",
  request: { query: listShipmentsQuerySchema },
  responses: {
    200: {
      description: "Paginated list of shipments",
      ...jsonBody(
        z.object({
          data: z.array(shipmentSchema),
          total: z.number(),
          page: z.number(),
          per_page: z.number(),
        })
      ),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/shipments/{id}",
  tags: ["Shipments"],
  summary: "Get a shipment by id",
  request: { params: idParam },
  responses: {
    200: { description: "The shipment", ...jsonBody(shipmentSchema) },
    ...errorResponses,
  },
});

registry.registerPath({
  method: "get",
  path: "/shipments/{id}/valid-transitions",
  tags: ["Shipments"],
  summary: "Get the valid next statuses for a shipment (for the status dropdown)",
  request: { params: idParam },
  responses: {
    200: {
      description: "Valid target statuses",
      ...jsonBody(z.object({ valid_target_statuses: z.array(shipmentStatusSchema) })),
    },
    ...errorResponses,
  },
});

registry.registerPath({
  method: "post",
  path: "/shipments",
  tags: ["Shipments"],
  summary: "Create a shipment",
  request: { body: jsonBody(createShipmentSchema) },
  responses: {
    201: { description: "Created shipment", ...jsonBody(shipmentSchema) },
    ...errorResponses,
  },
});

registry.registerPath({
  method: "put",
  path: "/shipments/{id}",
  tags: ["Shipments"],
  summary: "Update editable shipment fields (delivery_by_date, lat, lng)",
  request: { params: idParam, body: jsonBody(updateShipmentSchema) },
  responses: {
    200: { description: "Updated shipment", ...jsonBody(shipmentSchema) },
    ...errorResponses,
  },
});

registry.registerPath({
  method: "patch",
  path: "/shipments/{id}/status",
  tags: ["Shipments"],
  summary: "Transition a shipment's status (enforces valid transition rules)",
  request: { params: idParam, body: jsonBody(transitionShipmentStatusSchema) },
  responses: {
    200: { description: "Shipment after transition", ...jsonBody(shipmentSchema) },
    ...errorResponses,
  },
});

registry.registerPath({
  method: "delete",
  path: "/shipments/{id}",
  tags: ["Shipments"],
  summary: "Delete a shipment",
  request: { params: idParam },
  responses: {
    204: { description: "Deleted" },
    ...errorResponses,
  },
});

// ---- Assignments ----

registry.registerPath({
  method: "get",
  path: "/assignments",
  tags: ["Assignments"],
  summary: "List assignments (filter by status/search, paginate)",
  request: { query: listAssignmentsQuerySchema },
  responses: {
    200: {
      description: "Paginated list of assignments",
      ...jsonBody(
        z.object({
          data: z.array(assignmentSchema),
          total: z.number(),
          page: z.number(),
          per_page: z.number(),
        })
      ),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/assignments/{id}",
  tags: ["Assignments"],
  summary: "Get an assignment by id",
  request: { params: idParam },
  responses: {
    200: { description: "The assignment", ...jsonBody(assignmentSchema) },
    ...errorResponses,
  },
});

registry.registerPath({
  method: "get",
  path: "/assignments/{id}/shipments",
  tags: ["Assignments"],
  summary: "List shipments belonging to an assignment",
  request: { params: idParam },
  responses: {
    200: { description: "Shipments in the assignment", ...jsonBody(z.array(shipmentSchema)) },
    ...errorResponses,
  },
});

registry.registerPath({
  method: "post",
  path: "/assignments",
  tags: ["Assignments"],
  summary: "Create an assignment",
  request: { body: jsonBody(createAssignmentSchema) },
  responses: {
    201: { description: "Created assignment", ...jsonBody(assignmentSchema) },
    ...errorResponses,
  },
});

registry.registerPath({
  method: "delete",
  path: "/assignments/{id}",
  tags: ["Assignments"],
  summary: "Delete an assignment (must have zero shipments)",
  request: { params: idParam },
  responses: {
    204: { description: "Deleted" },
    ...errorResponses,
  },
});

// ---- Misc ----

registry.registerPath({
  method: "get",
  path: "/statuses",
  tags: ["Misc"],
  summary: "List possible shipment statuses",
  responses: {
    200: {
      description: "Statuses",
      ...jsonBody(z.array(z.object({ id: shipmentStatusSchema }))),
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["Misc"],
  summary: "Health check",
  responses: {
    200: { description: "OK", ...jsonBody(z.object({ status: z.literal("ok") })) },
  },
});

// Referenced so it isn't considered unused; also documents the enum in components.
void assignmentStatusSchema;

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "GoJitsu Shipment Management API",
      version: "1.0.0",
      description:
        "Backend API for the Shipment Management exercise. This spec is the source of truth consumed by the frontend's `npm run gen-api` script to generate TypeScript types.",
    },
    servers: [{ url: "http://localhost:3001" }],
  });
}
