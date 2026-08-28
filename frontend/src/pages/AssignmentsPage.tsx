import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import {
  useAssignment,
  useAssignments,
  useCreateAssignment,
  useDeleteAssignment,
  useAssignmentShipments,
} from "../hooks/useAssignments";

export function AssignmentsPage() {
  const search = useSearch({ from: "/assignments" });
  const navigate = useNavigate({ from: "/assignments" });
  const [newLabel, setNewLabel] = useState("");

  const createAssignmentMutation = useCreateAssignment();
  const deleteAssignmentMutation = useDeleteAssignment();

  const { data: assignments, isLoading, isError } = useAssignments({
    status: search.status,
    search: search.search,
  });

  const selectedId = search.selected;
  const { data: selectedAssignment, isLoading: isLoadingAssignment } = useAssignment(
    selectedId
  );
  const { data: shipments, isLoading: isLoadingShipments } = useAssignmentShipments(
    selectedId
  );

  const handleSearchChange = (value: string) => {
    navigate({ search: (prev) => ({ ...prev, search: value || undefined }) });
  };

  const handleStatusChange = (value: "OPEN" | "COMPLETED" | "") => {
    navigate({
      search: (prev) => ({
        ...prev,
        status: value || undefined,
        selected: undefined,
      }),
    });
  };

  const handleSelectAssignment = (id: string) => {
    navigate({ search: (prev) => ({ ...prev, selected: id }) });
  };

  const handleCreateAssignment = () => {
    const label = newLabel.trim();
    if (!label) return;

    createAssignmentMutation.mutate(
      { label },
      {
        onSuccess: (created) => {
          setNewLabel("");
          if (created?.id) {
            navigate({ search: (prev) => ({ ...prev, selected: created.id }) });
          }
        },
      }
    );
  };

  const handleDeleteAssignment = () => {
    if (!selectedAssignment) return;
    if (!window.confirm(`Delete assignment "${selectedAssignment.label}"?`)) return;

    deleteAssignmentMutation.mutate(selectedAssignment.id, {
      onSuccess: () => {
        navigate({ search: (prev) => ({ ...prev, selected: undefined }) });
      },
    });
  };

  return (
    <div className="flex h-full">
      <div className="w-96 shrink-0 border-r border-gray-200">
        <div className="space-y-2 border-b border-gray-200 p-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New assignment label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleCreateAssignment}
              disabled={!newLabel.trim() || createAssignmentMutation.isPending}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createAssignmentMutation.isPending ? "Creating…" : "Create"}
            </button>
          </div>
          <input
            type="text"
            placeholder="Search assignments..."
            value={search.search ?? ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={search.status ?? ""}
            onChange={(e) => handleStatusChange(e.target.value as "OPEN" | "COMPLETED" | "")}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
          {createAssignmentMutation.isError && (
            <p className="text-xs text-red-600">Failed to create assignment.</p>
          )}
        </div>

        <div className="h-[calc(100vh-114px)] overflow-y-auto">
          {isLoading && <p className="p-3 text-sm text-gray-400">Loading assignments…</p>}
          {isError && <p className="p-3 text-sm text-red-600">Failed to load assignments.</p>}

          {!isLoading && !isError && assignments?.length === 0 && (
            <p className="p-3 text-sm text-gray-400">No assignments found.</p>
          )}

          {assignments?.map((assignment) => (
            <button
              key={assignment.id}
              type="button"
              onClick={() => handleSelectAssignment(assignment.id)}
              className={`w-full border-b border-gray-100 px-3 py-2 text-left hover:bg-gray-50 ${
                selectedId === assignment.id ? "bg-blue-50" : ""
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
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!selectedId ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Select an assignment to see details.
          </div>
        ) : isLoadingAssignment ? (
          <div className="text-sm text-gray-400">Loading assignment…</div>
        ) : !selectedAssignment ? (
          <div className="text-sm text-red-600">Assignment not found.</div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedAssignment.label}</h2>
                <p className="text-sm text-gray-500">{selectedAssignment.id}</p>
              </div>
              <button
                type="button"
                onClick={handleDeleteAssignment}
                disabled={
                  deleteAssignmentMutation.isPending || selectedAssignment.shipment_count > 0
                }
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                title={
                  selectedAssignment.shipment_count > 0
                    ? "Cannot delete: assignment still has shipments"
                    : "Delete assignment"
                }
              >
                {deleteAssignmentMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">Status</dt>
              <dd className="text-gray-900">{selectedAssignment.status}</dd>

              <dt className="text-gray-500">Shipment count</dt>
              <dd className="text-gray-900">{selectedAssignment.shipment_count}</dd>

              <dt className="text-gray-500">Clients</dt>
              <dd className="text-gray-900">
                {selectedAssignment.clients.length > 0
                  ? selectedAssignment.clients.join(", ")
                  : "—"}
              </dd>
            </dl>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Shipments</h3>
              {deleteAssignmentMutation.isError && (
                <p className="mb-2 text-sm text-red-600">Failed to delete assignment.</p>
              )}
              {isLoadingShipments ? (
                <p className="text-sm text-gray-400">Loading shipments…</p>
              ) : shipments && shipments.length > 0 ? (
                <ul className="space-y-2">
                  {shipments.map((shipment) => (
                    <li
                      key={shipment.id}
                      className="rounded-md border border-gray-200 px-3 py-2 text-sm"
                    >
                      <p className="font-medium text-gray-900">{shipment.label}</p>
                      <p className="text-xs text-gray-500">
                        {shipment.client_name} · {shipment.status}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No shipments in this assignment.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
