import {
  useAssignment,
  useAssignmentShipments,
  useDeleteAssignment,
} from "../../hooks/useAssignments";
import { AssignmentShipmentList } from "./AssignmentShipmentList";

interface AssignmentDetailPanelProps {
  assignmentId: string | undefined;
  onDeleted: () => void;
}

export function AssignmentDetailPanel({ assignmentId, onDeleted }: AssignmentDetailPanelProps) {
  const { data: assignment, isLoading: isLoadingAssignment } = useAssignment(assignmentId);
  const { data: shipments, isLoading: isLoadingShipments } = useAssignmentShipments(assignmentId);
  const deleteAssignmentMutation = useDeleteAssignment();

  const handleDelete = () => {
    if (!assignment) return;
    if (!window.confirm(`Delete assignment "${assignment.label}"?`)) return;

    deleteAssignmentMutation.mutate(assignment.id, {
      onSuccess: () => onDeleted(),
    });
  };

  if (!assignmentId) {
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
          onClick={handleDelete}
          disabled={deleteAssignmentMutation.isPending || assignment.shipment_count > 0}
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          title={
            assignment.shipment_count > 0
              ? "Cannot delete: assignment still has shipments"
              : "Delete assignment"
          }
        >
          {deleteAssignmentMutation.isPending ? "Deleting…" : "Delete"}
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
        {deleteAssignmentMutation.isError && (
          <p className="mb-2 text-sm text-red-600">Failed to delete assignment.</p>
        )}
        <AssignmentShipmentList shipments={shipments} isLoading={isLoadingShipments} />
      </div>
    </div>
  );
}
