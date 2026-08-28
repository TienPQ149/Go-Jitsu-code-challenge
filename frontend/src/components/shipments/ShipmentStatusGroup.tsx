import { useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useInfiniteShipments } from "../../hooks/useInfiniteShipments";
import type { ShipmentStatus } from "../../types/domain";
import { ShipmentRow } from "./ShipmentRow";

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  OPEN: "Open",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
};

interface ShipmentStatusGroupProps {
  status: ShipmentStatus;
  search: string;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

const ROW_HEIGHT = 56;
const VIEWPORT_HEIGHT = 320;

export function ShipmentStatusGroup({
  status,
  search,
  selectedId,
  onSelect,
}: ShipmentStatusGroupProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteShipments(status, search);

  const shipments = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );
  const total = data?.pages[0]?.total ?? 0;

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? shipments.length + 1 : shipments.length,
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
      lastVirtualItem.index >= shipments.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [lastVirtualItem, shipments.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section className="border-b border-gray-200">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-gray-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
        <span>{STATUS_LABELS[status]}</span>
        <span className="text-gray-400">{total}</span>
      </header>

      {isError && (
        <div className="px-3 py-2 text-sm text-red-600">
          Failed to load {STATUS_LABELS[status].toLowerCase()} shipments.
        </div>
      )}

      {!isError && isLoading && (
        <div className="px-3 py-2 text-sm text-gray-400">Loading…</div>
      )}

      {!isError && !isLoading && total === 0 && (
        <div className="px-3 py-2 text-sm text-gray-400">No shipments.</div>
      )}

      {!isError && total > 0 && (
        <div
          ref={parentRef}
          className="overflow-y-auto"
          style={{ height: Math.min(VIEWPORT_HEIGHT, total * ROW_HEIGHT) }}
        >
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const shipment = shipments[virtualRow.index];
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
                  {shipment ? (
                    <ShipmentRow
                      shipment={shipment}
                      isSelected={shipment.id === selectedId}
                      onSelect={onSelect}
                    />
                  ) : (
                    <div className="px-3 py-2 text-xs text-gray-400">
                      Loading more…
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
