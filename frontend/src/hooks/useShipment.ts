import { useQuery } from "@tanstack/react-query";
import { getShipment, getValidTransitions } from "../api/shipments.api";
import { queryKeys } from "../constants/queryKeys";

export function useShipment(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.shipments.detail(id ?? ""),
    queryFn: () => getShipment(id as string),
    enabled: Boolean(id),
  });
}

/** Powers the status dropdown: only shows statuses that are a valid next step. */
export function useValidTransitions(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.shipments.validTransitions(id ?? ""),
    queryFn: () => getValidTransitions(id as string),
    enabled: Boolean(id),
  });
}
