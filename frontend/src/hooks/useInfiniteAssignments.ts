import { useInfiniteQuery } from "@tanstack/react-query";
import { listAssignments } from "../api/assignments.api";
import type { AssignmentStatus } from "../types/domain";
import { queryKeys } from "../constants/queryKeys";

const PAGE_SIZE = 50;

/**
 * Infinite-scroll pagination for the assignments list. The dataset can be
 * tens of thousands of rows (seeded via generate-data), so rendering them
 * all at once (unpaginated fetch + no virtualization) causes severe UI lag.
 * This fetches `PAGE_SIZE` rows at a time from the server (which supports
 * `_page`/`_per_page`) and loads more only as the user scrolls further into
 * the virtualized list.
 */
export function useInfiniteAssignments(status: AssignmentStatus | "", search: string) {
  return useInfiniteQuery({
    queryKey: [
      ...queryKeys.assignments.list({ status: status || undefined, search: search || undefined }),
      "infinite",
    ] as const,
    queryFn: ({ pageParam }) =>
      listAssignments({
        status: status || undefined,
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
