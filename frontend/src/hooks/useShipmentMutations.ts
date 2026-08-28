import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createShipment,
  deleteShipment,
  transitionShipmentStatus,
  updateShipment,
  type CreateShipmentPayload,
  type TransitionShipmentStatusPayload,
  type UpdateShipmentPayload,
} from "../api/shipments.api";
import { queryKeys } from "../constants/queryKeys";

/** Invalidates every shipment list + the given detail, and (since a status
 * transition can move a shipment in/out of an assignment) all assignment
 * data too, so counts/clients stay accurate without a full page reload. */
function invalidateAfterShipmentChange(
  queryClient: ReturnType<typeof useQueryClient>,
  shipmentId?: string
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
  if (shipmentId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.shipments.detail(shipmentId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.shipments.validTransitions(shipmentId),
    });
  }
  queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShipmentPayload) => createShipment(payload),
    onSuccess: () => invalidateAfterShipmentChange(queryClient),
  });
}

export function useUpdateShipment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateShipmentPayload) => updateShipment(id, payload),
    onSuccess: () => invalidateAfterShipmentChange(queryClient, id),
  });
}

export function useTransitionShipmentStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransitionShipmentStatusPayload) =>
      transitionShipmentStatus(id, payload),
    onSuccess: () => invalidateAfterShipmentChange(queryClient, id),
  });
}

export function useDeleteShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShipment(id),
    onSuccess: (_data, id) => invalidateAfterShipmentChange(queryClient, id),
  });
}
