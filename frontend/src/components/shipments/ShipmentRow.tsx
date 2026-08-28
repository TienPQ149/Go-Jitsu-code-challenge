import type { Shipment } from "../../types/domain";

interface ShipmentRowProps {
  shipment: Shipment;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function ShipmentRow({ shipment, isSelected, onSelect }: ShipmentRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(shipment.id)}
      className={`w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-blue-50 hover:bg-blue-50" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm text-gray-900 truncate">
          {shipment.client_name}
        </span>
        <span className="text-xs text-gray-400 shrink-0">
          {new Date(shipment.arrival_date).toLocaleDateString()}
        </span>
      </div>
      <div className="text-xs text-gray-500 truncate">{shipment.label}</div>
    </button>
  );
}
