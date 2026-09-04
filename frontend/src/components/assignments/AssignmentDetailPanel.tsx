import type { Assignment, Shipment } from "../../types/domain";
import { AssignmentShipmentList } from "./AssignmentShipmentList";

interface AssignmentDetailPanelProps {
  selectedId: string | undefined;
  isLoadingAssignment: boolean;
  assignment: Assignment | undefined;
  shipments: Shipment[] | undefined;
  isLoadingShipments: boolean;
  onDelete: () => void;
  isDeletePending: boolean;
  isDeleteError: boolean;
}

export function AssignmentDetailPanel({
  selectedId,
  isLoadingAssignment,
  assignment,
  shipments,
  isLoadingShipments,
  onDelete,
  isDeletePending,
  isDeleteError,
}: AssignmentDetailPanelProps) {
  if (!selectedId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Select an assignment to see details.
      </div>
    );
  }

  if (isLoadingAssignment) {
    return <div className="text-sm text-gray-400">Loading assignment…</div>;
  }

  if (!assignment) {
    return <div className="text-sm text-red-600">Assignment not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{assignment.label}</h2>
          <p className="text-sm text-gray-500">{assignment.id}</p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeletePending || assignment.shipment_count > 0}
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          title={
            assignment.shipment_count > 0
              ? "Cannot delete: assignment still has shipments"
              : "Delete assignment"
          }
        >
          {isDeletePending ? "Deleting…" : "Delete"}
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-gray-500">Status</dt>
        <dd className="text-gray-900">{assignment.status}</dd>

        <dt className="text-gray-500">Shipment count</dt>
        <dd className="text-gray-900">{assignment.shipment_count}</dd>

        <dt className="text-gray-500">Clients</dt>
        <dd className="text-gray-900">
          {assignment.clients.length > 0 ? assignment.clients.join(", ") : "—"}
        </dd>
      </dl>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Shipments</h3>
        {isDeleteError && (
          <p className="mb-2 text-sm text-red-600">Failed to delete assignment.</p>
        )}
        <AssignmentShipmentList shipments={shipments} isLoading={isLoadingShipments} />
      </div>
    </div>
  );
}
