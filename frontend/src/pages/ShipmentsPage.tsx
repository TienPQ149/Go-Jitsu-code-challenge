import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ShipmentListPanel } from "../components/shipments/ShipmentListPanel";
import { ShipmentDetailPanel } from "../components/shipments/ShipmentDetailPanel";
import { CreateShipmentModal } from "../components/shipments/CreateShipmentModal";

export function ShipmentsPage() {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleSelect = (id: string) => {
    navigate({ search: (prev) => ({ ...prev, selected: id }) });
  };

  const handleSearchChange = (value: string) => {
    navigate({ search: (prev) => ({ ...prev, search: value || undefined }) });
  };

  const handleDeleted = () => {
    navigate({ search: (prev) => ({ ...prev, selected: undefined }) });
  };

  return (
    <div className="flex h-full">
      <div className="w-96 shrink-0 flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
          <h1 className="text-sm font-semibold text-gray-900">Shipments</h1>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            New shipment
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <ShipmentListPanel
            searchInitial={search.search ?? ""}
            selectedId={search.selected}
            onSelect={handleSelect}
            onSearchChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="flex-1">
        <ShipmentDetailPanel shipmentId={search.selected} onDeleted={handleDeleted} />
      </div>

      {isCreateOpen && (
        <CreateShipmentModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={(id) => {
            setIsCreateOpen(false);
            handleSelect(id);
          }}
        />
      )}
    </div>
  );
}
