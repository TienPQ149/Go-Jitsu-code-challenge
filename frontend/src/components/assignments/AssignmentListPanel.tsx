import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCreateAssignment } from "../../hooks/useAssignments";
import { useInfiniteAssignments } from "../../hooks/useInfiniteAssignments";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { AssignmentRow } from "./AssignmentRow";
import { AssignmentFilters } from "./AssignmentFilters";
import { CreateAssignmentForm } from "./CreateAssignmentForm";

type AssignmentStatusFilter = "OPEN" | "COMPLETED" | "";

interface AssignmentListPanelProps {
  search: string;
  status: AssignmentStatusFilter;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AssignmentStatusFilter) => void;
}

const ROW_HEIGHT = 56;

export function AssignmentListPanel({
  search,
  status,
  selectedId,
  onSelect,
  onSearchChange,
  onStatusChange,
}: AssignmentListPanelProps) {
  const [newLabel, setNewLabel] = useState("");
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // Sync the debounced value up to the URL so it's shareable / back-forward safe.
  useEffect(() => {
    onSearchChange(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteAssignments(status, debouncedSearch);
  const createAssignmentMutation = useCreateAssignment();

  const assignments = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );
  const total = data?.pages[0]?.total ?? 0;

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? assignments.length + 1 : assignments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastVirtualItem = virtualItems[virtualItems.length - 1];

  // Fetch the next page once the virtualizer is about to render the
  // trailing "loading" placeholder row, i.e. the user scrolled near the end.
  useEffect(() => {
    if (!lastVirtualItem) return;
    if (
      lastVirtualItem.index >= assignments.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [lastVirtualItem, assignments.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCreateAssignment = () => {
    const label = newLabel.trim();
    if (!label) return;

    createAssignmentMutation.mutate(
      { label },
      {
        onSuccess: (created) => {
          setNewLabel("");
          if (created?.id) {
            onSelect(created.id);
          }
        },
      }
    );
  };

  return (
    <div className="w-96 shrink-0 border-r border-gray-200">
      <div className="space-y-2 border-b border-gray-200 p-3">
        <CreateAssignmentForm
          value={newLabel}
          onChange={setNewLabel}
          onSubmit={handleCreateAssignment}
          isPending={createAssignmentMutation.isPending}
          isError={createAssignmentMutation.isError}
        />
        <AssignmentFilters
          search={searchInput}
          status={status}
          onSearchChange={setSearchInput}
          onStatusChange={onStatusChange}
        />
      </div>

      <div ref={parentRef} className="h-[calc(100vh-114px)] overflow-y-auto">
        {isLoading && <p className="p-3 text-sm text-gray-400">Loading assignments…</p>}
        {isError && <p className="p-3 text-sm text-red-600">Failed to load assignments.</p>}

        {!isLoading && !isError && total === 0 && (
          <p className="p-3 text-sm text-gray-400">No assignments found.</p>
        )}

        {!isLoading && !isError && total > 0 && (
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const assignment = assignments[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {assignment ? (
                    <AssignmentRow
                      assignment={assignment}
                      isSelected={selectedId === assignment.id}
                      onSelect={onSelect}
                    />
                  ) : (
                    <div className="px-3 py-2 text-xs text-gray-400">Loading more…</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
