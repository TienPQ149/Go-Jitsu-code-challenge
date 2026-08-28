import type { ListAssignmentsParams } from "../api/assignments.api";
import type { ListShipmentsParams } from "../api/shipments.api";

/**
 * Centralized query key factory. Keeping key shapes in one place avoids
 * typos/mismatches between the query that fetches data and the invalidation
 * calls that need to target it after a mutation.
 */
export const queryKeys = {
  shipments: {
    all: ["shipments"] as const,
    lists: () => [...queryKeys.shipments.all, "list"] as const,
    list: (params: ListShipmentsParams) =>
      [...queryKeys.shipments.lists(), params] as const,
    details: () => [...queryKeys.shipments.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.shipments.details(), id] as const,
    validTransitions: (id: string) =>
      [...queryKeys.shipments.all, "valid-transitions", id] as const,
  },
  assignments: {
    all: ["assignments"] as const,
    lists: () => [...queryKeys.assignments.all, "list"] as const,
    list: (params: ListAssignmentsParams) =>
      [...queryKeys.assignments.lists(), params] as const,
    details: () => [...queryKeys.assignments.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.assignments.details(), id] as const,
    shipments: (id: string) =>
      [...queryKeys.assignments.all, "shipments", id] as const,
  },
};
