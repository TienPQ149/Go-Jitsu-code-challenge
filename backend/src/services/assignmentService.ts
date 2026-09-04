import { nanoid } from "nanoid";
import { Assignment } from "../types/domain";
import { CreateAssignmentInput, ListAssignmentsQuery } from "../schemas/assignment.schema";
import { assignmentStore } from "../repositories/assignmentRepository";
import { shipmentStore } from "../repositories/shipmentRepository";
import { AppError } from "../utils/AppError";

export function listAssignments(query: ListAssignmentsQuery): {
  data: Assignment[];
  total: number;
  page: number;
  per_page: number;
} {
  let items = assignmentStore.findAll();

  if (query.status) {
    items = items.filter((a) => a.status === query.status);
  }

  if (query.search) {
    const term = query.search.toLowerCase();
    items = items.filter((a) => a.label.toLowerCase().includes(term));
  }

  const total = items.length;
  const page = query._page ?? 1;
  const perPage = query._per_page ?? (total || 1);
  const start = (page - 1) * perPage;
  const paged = query._page || query._per_page ? items.slice(start, start + perPage) : items;

  return { data: paged, total, page, per_page: perPage };
}

export function getAssignmentOrThrow(id: string): Assignment {
  const assignment = assignmentStore.findById(id);
  if (!assignment) throw AppError.notFound("Assignment", id);
  return assignment;
}

export function getShipmentsForAssignment(id: string) {
  getAssignmentOrThrow(id);
  return shipmentStore.findAll().filter((s) => s.assignment_id === id);
}

export function createAssignment(input: CreateAssignmentInput): Assignment {
  const assignment: Assignment = {
    id: `as_${nanoid(8)}`,
    label: input.label,
    status: input.status ?? "OPEN",
    clients: input.clients ?? [],
    shipment_count: 0,
  };
  return assignmentStore.insert(assignment);
}

export function deleteAssignment(id: string): void {
  const assignment = getAssignmentOrThrow(id);
  if (assignment.shipment_count > 0) {
    throw AppError.conflict(
      `Assignment '${id}' still has ${assignment.shipment_count} shipment(s); only empty assignments can be deleted`
    );
  }
  const deleted = assignmentStore.delete(id);
  if (!deleted) throw AppError.notFound("Assignment", id);
}

/**
 * Recomputes shipment_count and clients[] for the assignments a shipment moved
 * from/to, keeping derived fields consistent after any shipment mutation.
 */
export function syncAssignmentAfterShipmentChange(
  previousAssignmentId: string | null | undefined,
  newAssignmentId: string | null | undefined
): void {
  const touched = new Set(
    [previousAssignmentId, newAssignmentId].filter(
      (id): id is string => Boolean(id)
    )
  );

  for (const assignmentId of touched) {
    const assignment = assignmentStore.findById(assignmentId);
    if (!assignment) continue;

    const shipmentsInAssignment = shipmentStore
      .findAll()
      .filter((s) => s.assignment_id === assignmentId);

    const clients = Array.from(
      new Set(shipmentsInAssignment.map((s) => s.client_name))
    );

    assignmentStore.update(assignmentId, {
      shipment_count: shipmentsInAssignment.length,
      clients,
    });
  }
}
