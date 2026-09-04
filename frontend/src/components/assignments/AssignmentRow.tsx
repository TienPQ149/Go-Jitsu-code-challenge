import type { Assignment } from "../../types/domain";

interface AssignmentRowProps {
  assignment: Assignment;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function AssignmentRow({ assignment, isSelected, onSelect }: AssignmentRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(assignment.id)}
      className={`w-full border-b border-gray-100 px-3 py-2 text-left hover:bg-gray-50 ${
        isSelected ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-900">{assignment.label}</span>
        <span className="text-xs text-gray-500">{assignment.status}</span>
      </div>
      <p className="text-xs text-gray-500">
        {assignment.shipment_count} shipments · {assignment.clients.length} clients
      </p>
    </button>
  );
}
