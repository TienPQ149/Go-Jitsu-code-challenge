import { Router } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createShipmentSchema,
  listShipmentsQuerySchema,
  transitionShipmentStatusSchema,
  updateShipmentSchema,
} from "../schemas/shipment.schema";
import {
  createShipment,
  deleteShipment,
  getShipmentOrThrow,
  listShipments,
  transitionShipmentStatus,
  updateShipmentFields,
} from "../services/shipmentService";
import { validTargetStatuses } from "../utils/statusTransitions";

export const shipmentsRouter = Router();

// GET /shipments?status=&search=&_page=&_per_page=
shipmentsRouter.get(
  "/",
  validate(listShipmentsQuerySchema, "query"),
  asyncHandler((req, res) => {
    const result = listShipments(req.query as any);
    res.json(result);
  })
);

// GET /shipments/:id
shipmentsRouter.get(
  "/:id",
  asyncHandler((req, res) => {
    const shipment = getShipmentOrThrow(req.params.id);
    res.json(shipment);
  })
);

// GET /shipments/:id/valid-transitions - helper for the FE status dropdown
shipmentsRouter.get(
  "/:id/valid-transitions",
  asyncHandler((req, res) => {
    const shipment = getShipmentOrThrow(req.params.id);
    res.json({ valid_target_statuses: validTargetStatuses(shipment.status) });
  })
);

// POST /shipments
shipmentsRouter.post(
  "/",
  validate(createShipmentSchema),
  asyncHandler((req, res) => {
    const shipment = createShipment(req.body);
    res.status(201).json(shipment);
  })
);

// PUT /shipments/:id - editable fields only (delivery_by_date, lat, lng)
shipmentsRouter.put(
  "/:id",
  validate(updateShipmentSchema),
  asyncHandler((req, res) => {
    const shipment = updateShipmentFields(req.params.id, req.body);
    res.json(shipment);
  })
);

// PATCH /shipments/:id/status - dedicated endpoint enforcing transition rules
shipmentsRouter.patch(
  "/:id/status",
  validate(transitionShipmentStatusSchema),
  asyncHandler((req, res) => {
    const { status, assignment_id } = req.body;
    const shipment = transitionShipmentStatus(req.params.id, status, assignment_id);
    res.json(shipment);
  })
);

// DELETE /shipments/:id
shipmentsRouter.delete(
  "/:id",
  asyncHandler((req, res) => {
    deleteShipment(req.params.id);
    res.status(204).send();
  })
);
