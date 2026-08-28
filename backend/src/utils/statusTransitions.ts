import { ShipmentStatus } from "../types/domain";
import { AppError } from "./AppError";

/**
 * The only valid shipment status transitions per the exercise spec:
 *  - OPEN        -> IN_TRANSIT  (requires an assignment_id to be set)
 *  - IN_TRANSIT  -> DELIVERED   (delivery completed)
 *  - IN_TRANSIT  -> OPEN        (reverted; assignment_id must be cleared)
 * Everything else (including any transition out of DELIVERED) is invalid.
 */
const VALID_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  OPEN: ["IN_TRANSIT"],
  IN_TRANSIT: ["DELIVERED", "OPEN"],
  DELIVERED: [],
};

export function validTargetStatuses(current: ShipmentStatus): ShipmentStatus[] {
  return VALID_TRANSITIONS[current];
}

export function assertValidTransition(
  current: ShipmentStatus,
  next: ShipmentStatus
): void {
  if (current === next) {
    throw AppError.badRequest(`Shipment is already '${current}'`);
  }
  if (!VALID_TRANSITIONS[current].includes(next)) {
    throw AppError.badRequest(
      `Invalid status transition: '${current}' -> '${next}'. Valid target(s) from '${current}': ${
        VALID_TRANSITIONS[current].join(", ") || "(none)"
      }`
    );
  }
}

/**
 * Computes the assignment_id the shipment should have after the transition,
 * enforcing the assignment-related side effects described in the spec.
 */
export function resolveAssignmentIdForTransition(
  next: ShipmentStatus,
  requestedAssignmentId: string | null | undefined
): string | null {
  if (next === "IN_TRANSIT") {
    if (!requestedAssignmentId) {
      throw AppError.badRequest(
        "assignment_id is required when transitioning a shipment to IN_TRANSIT"
      );
    }
    return requestedAssignmentId;
  }

  if (next === "OPEN") {
    // Reverting to OPEN always clears the assignment, regardless of what was sent.
    return null;
  }

  // DELIVERED keeps whatever assignment it already had.
  return requestedAssignmentId ?? null;
}
