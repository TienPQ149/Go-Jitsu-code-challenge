import { nanoid } from "nanoid";
import { Shipment } from "../types/domain";
import {
  CreateShipmentInput,
  ListShipmentsQuery,
  UpdateShipmentInput,
} from "../schemas/shipment.schema";
import { shipmentStore } from "../repositories/shipmentRepository";
import { assignmentStore } from "../repositories/assignmentRepository";
import { AppError } from "../utils/AppError";
import {
  assertValidTransition,
  resolveAssignmentIdForTransition,
} from "../utils/statusTransitions";
import { syncAssignmentAfterShipmentChange } from "./assignmentService";


export function listShipments(query: ListShipmentsQuery): {
  data: Shipment[];
  total: number;
  page: number;
  per_page: number;
} {
  let items = shipmentStore.findAll();

  if (query.status) {
    items = items.filter((s) => s.status === query.status);
  }

  if (query.search) {
    const term = query.search.toLowerCase();
    items = items.filter(
      (s) =>
        s.label.toLowerCase().includes(term) ||
        s.client_name.toLowerCase().includes(term)
    );
  }

  const total = items.length;
  const page = query._page ?? 1;
  const perPage = query._per_page ?? (total || 1);
  const start = (page - 1) * perPage;
  const paged = query._page || query._per_page ? items.slice(start, start + perPage) : items;

  return { data: paged, total, page, per_page: perPage };
}

export function getShipmentOrThrow(id: string): Shipment {
  const shipment = shipmentStore.findById(id);
  if (!shipment) throw AppError.notFound("Shipment", id);
  return shipment;
}

export function createShipment(input: CreateShipmentInput): Shipment {
  const now = new Date();
  const inTwoDays = new Date(now.getTime() + 2 * 86400000);

  const shipment: Shipment = {
    id: `shp_${nanoid(8)}`,
    client_name: input.client_name,
    label: input.label,
    status: input.status ?? "OPEN",
    arrival_date: input.arrival_date ?? now.toISOString(),
    delivery_by_date: input.delivery_by_date ?? inTwoDays.toISOString(),
    eta: input.eta ?? inTwoDays.toISOString(),
    warehouse_id: input.warehouse_id ?? "581",
    assignment_id: input.assignment_id ?? null,
    lat: input.lat ?? 32.8,
    lng: input.lng ?? -96.95,
  };

  return shipmentStore.insert(shipment);
}

export function updateShipmentFields(
  id: string,
  patch: UpdateShipmentInput
): Shipment {
  getShipmentOrThrow(id);
  const updated = shipmentStore.update(id, patch);
  if (!updated) throw AppError.notFound("Shipment", id);
  return updated;
}

export function transitionShipmentStatus(
  id: string,
  nextStatus: Shipment["status"],
  requestedAssignmentId: string | null | undefined
): Shipment {
  const shipment = getShipmentOrThrow(id);

  assertValidTransition(shipment.status, nextStatus);

  if (nextStatus === "IN_TRANSIT") {
    const assignmentId = requestedAssignmentId;
    if (assignmentId && !assignmentStore.findById(assignmentId)) {
      throw AppError.badRequest(`Assignment '${assignmentId}' does not exist`);
    }
  }

  const resolvedAssignmentId = resolveAssignmentIdForTransition(
    nextStatus,
    requestedAssignmentId
  );

  const previousAssignmentId = shipment.assignment_id;

  const updated = shipmentStore.update(id, {
    status: nextStatus,
    assignment_id: resolvedAssignmentId,
  });
  if (!updated) throw AppError.notFound("Shipment", id);

  // Keep assignment shipment_count/clients in sync with this shipment's move.
  syncAssignmentAfterShipmentChange(previousAssignmentId, resolvedAssignmentId);

  return updated;
}

export function deleteShipment(id: string): void {
  const shipment = getShipmentOrThrow(id);
  const deleted = shipmentStore.delete(id);
  if (!deleted) throw AppError.notFound("Shipment", id);
  syncAssignmentAfterShipmentChange(shipment.assignment_id, null);
}
