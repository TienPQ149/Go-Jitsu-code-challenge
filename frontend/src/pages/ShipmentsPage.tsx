import { useNavigate, useSearch } from "@tanstack/react-router";
import { ShipmentListPanel } from "../components/shipments/ShipmentListPanel";
import { ShipmentDetailPanel } from "../components/shipments/ShipmentDetailPanel";

export function ShipmentsPage() {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  const handleSelect = (id: string) => {
    navigate({ search: (prev) => ({ ...prev, selected: id }) });
  };

  const handleSearchChange = (value: string) => {
    navigate({ search: (prev) => ({ ...prev, search: value || undefined }) });
  };

  return (
    <div className="flex h-screen">
      <div className="w-96 shrink-0">
        <ShipmentListPanel
          searchInitial={search.search ?? ""}
          selectedId={search.selected}
          onSelect={handleSelect}
          onSearchChange={handleSearchChange}
        />
      </div>
      <div className="flex-1">
        <ShipmentDetailPanel shipmentId={search.selected} />
      </div>
    </div>
  );
}
