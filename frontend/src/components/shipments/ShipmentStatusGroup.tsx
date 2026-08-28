import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useInfiniteShipments } from "../../hooks/useInfiniteShipments";
import type { ShipmentStatus } from "../../types/domain";
import { ShipmentRow } from "./ShipmentRow";

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  OPEN: "Open",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
};

const STATUS_HEADER_STYLES: Record<ShipmentStatus, string> = {
  OPEN: "bg-amber-600 text-white",
  IN_TRANSIT: "bg-blue-700 text-white",
  DELIVERED: "bg-emerald-700 text-white",
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
  const [isOpen, setIsOpen] = useState(true);
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
    if (!isOpen || !lastVirtualItem) return;
    if (
      lastVirtualItem.index >= shipments.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [isOpen, lastVirtualItem, shipments.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section className="border-b border-gray-200">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={`sticky top-0 z-10 flex w-full items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wide shadow-sm transition-colors ${STATUS_HEADER_STYLES[status]}`}
      >
        <span className="flex items-center gap-2">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
          >
            <path d="M7.05 4.05a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 1 1-1.414-1.414L11.586 10 7.05 5.464a1 1 0 0 1 0-1.414z" />
          </svg>
          {STATUS_LABELS[status]}
        </span>
        <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">{total}</span>
      </button>

      {isOpen && isError && (
        <div className="px-3 py-2 text-sm text-red-600">
          Failed to load {STATUS_LABELS[status].toLowerCase()} shipments.
        </div>
      )}

      {isOpen && !isError && isLoading && (
        <div className="px-3 py-2 text-sm text-gray-400">Loading…</div>
      )}

      {isOpen && !isError && !isLoading && total === 0 && (
        <div className="px-3 py-2 text-sm text-gray-400">No shipments.</div>
      )}

      {isOpen && !isError && total > 0 && (
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
