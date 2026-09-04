import type { Shipment } from "../../types/domain";

interface AssignmentShipmentListProps {
  shipments: Shipment[] | undefined;
  isLoading: boolean;
}

export function AssignmentShipmentList({ shipments, isLoading }: AssignmentShipmentListProps) {
  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading shipments…</p>;
  }

  if (!shipments || shipments.length === 0) {
    return <p className="text-sm text-gray-400">No shipments in this assignment.</p>;
  }

  return (
    <ul className="space-y-2">
      {shipments.map((shipment) => (
        <li key={shipment.id} className="rounded-md border border-gray-200 px-3 py-2 text-sm">
          <p className="font-medium text-gray-900">{shipment.label}</p>
          <p className="text-xs text-gray-500">
            {shipment.client_name} · {shipment.status}
          </p>
        </li>
      ))}
    </ul>
  );
}
