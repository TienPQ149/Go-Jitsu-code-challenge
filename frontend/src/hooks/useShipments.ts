import { useQuery } from "@tanstack/react-query";
import { listShipments, type ListShipmentsParams } from "../api/shipments.api";
import { queryKeys } from "../constants/queryKeys";

/**
 * Fetches a page of shipments from the server (status filter, search, and
 * pagination are all handled server-side — see the backend's `listShipments`
 * service — so the client never has to pull the whole 100k+ dataset at once).
 */
export function useShipments(params: ListShipmentsParams) {
  return useQuery({
    queryKey: queryKeys.shipments.list(params),
    queryFn: () => listShipments(params),
    placeholderData: (previousData) => previousData,
  });
}
