import { useInfiniteQuery } from "@tanstack/react-query";
import { listShipments } from "../api/shipments.api";
import type { ShipmentStatus } from "../types/domain";
import { queryKeys } from "./queryKeys";

const PAGE_SIZE = 50;

/**
 * Infinite-scroll pagination for one status group. Rather than loading a
 * shipment dataset that can exceed 100k rows in one request, this fetches
 * `PAGE_SIZE` rows at a time from the server (which already supports
 * `_page`/`_per_page`) and loads more only as the user scrolls further into
 * that group's virtualized list.
 */
export function useInfiniteShipments(status: ShipmentStatus, search: string) {
  return useInfiniteQuery({
    queryKey: [
      ...queryKeys.shipments.list({ status, search }),
      "infinite",
    ] as const,
    queryFn: ({ pageParam }) =>
      listShipments({
        status,
        search: search || undefined,
        _page: pageParam,
        _per_page: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });
}
