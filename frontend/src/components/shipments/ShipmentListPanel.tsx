import { useEffect, useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { ShipmentStatusGroup } from "./ShipmentStatusGroup";
import type { ShipmentStatus } from "../../types/domain";

const STATUSES: ShipmentStatus[] = ["OPEN", "IN_TRANSIT", "DELIVERED"];

interface ShipmentListPanelProps {
  searchInitial: string;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onSearchChange: (search: string) => void;
}

export function ShipmentListPanel({
  searchInitial,
  selectedId,
  onSelect,
  onSearchChange,
}: ShipmentListPanelProps) {
  const [searchInput, setSearchInput] = useState(searchInitial);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // Sync the debounced value up to the URL so it's shareable / back-forward safe.
  useEffect(() => {
    onSearchChange(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);


  return (
    <div className="flex h-full flex-col border-r border-gray-200">
      <div className="p-3 border-b border-gray-200">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by label or client name…"
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {STATUSES.map((status) => (
          <ShipmentStatusGroup
            key={status}
            status={status}
            search={debouncedSearch}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
