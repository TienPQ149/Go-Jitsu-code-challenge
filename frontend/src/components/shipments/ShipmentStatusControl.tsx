import { useState } from "react";
import { useAssignments } from "../../hooks/useAssignments";
import { useTransitionShipmentStatus } from "../../hooks/useShipmentMutations";
import { useValidTransitions } from "../../hooks/useShipment";
import type { Shipment, ShipmentStatus } from "../../types/domain";

interface ShipmentStatusControlProps {
  shipment: Shipment;
}

/**
 * Status dropdown that only ever offers valid next statuses (from
 * GET /shipments/:id/valid-transitions), and — per the business rule —
 * requires picking an existing assignment when moving OPEN -> IN_TRANSIT.
 * The backend re-validates all of this too; this UI just prevents the
 * obviously-invalid case from being submitted in the first place.
 */
export function ShipmentStatusControl({ shipment }: ShipmentStatusControlProps) {
  const { data: transitions } = useValidTransitions(shipment.id);
  const { data: assignmentsResult } = useAssignments({ status: "OPEN" });
  const assignments = assignmentsResult?.data;
  const transitionMutation = useTransitionShipmentStatus(shipment.id);

  const [pendingStatus, setPendingStatus] = useState<ShipmentStatus | "">("");
  const [assignmentId, setAssignmentId] = useState("");

  const validTargets = transitions?.valid_target_statuses ?? [];
  const needsAssignment = pendingStatus === "IN_TRANSIT";

  const handleApply = () => {
    if (!pendingStatus) return;
    if (needsAssignment && !assignmentId) return;

    transitionMutation.mutate(
      {
        status: pendingStatus,
        assignment_id: needsAssignment ? assignmentId : undefined,
      },
      {
        onSuccess: () => {
          setPendingStatus("");
          setAssignmentId("");
        },
      }
    );
  };

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Status</span>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
          {shipment.status}
        </span>
      </div>

      {validTargets.length === 0 ? (
        <p className="text-xs text-gray-400">No further transitions available.</p>
      ) : (
        <div className="space-y-2">
          <select
            value={pendingStatus}
            onChange={(e) => {
              setPendingStatus(e.target.value as ShipmentStatus | "");
              setAssignmentId("");
            }}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Change status to…</option>
            {validTargets.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {needsAssignment && (
            <select
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select an assignment…</option>
              {assignments?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handleApply}
            disabled={
              !pendingStatus ||
              (needsAssignment && !assignmentId) ||
              transitionMutation.isPending
            }
            className="w-full rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {transitionMutation.isPending ? "Applying…" : "Apply transition"}
          </button>

          {transitionMutation.isError && (
            <p className="text-xs text-red-600">
              {(transitionMutation.error as { error?: string })?.error ??
                "Failed to change status."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
