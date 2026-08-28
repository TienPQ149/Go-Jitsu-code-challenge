import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  useAssignment,
  useAssignments,
  useAssignmentShipments,
} from "../hooks/useAssignments";

export function AssignmentsPage() {
  const search = useSearch({ from: "/assignments" });
  const navigate = useNavigate({ from: "/assignments" });

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

  return (
    <div className="flex h-screen">
      <div className="w-96 shrink-0 border-r border-gray-200">
        <div className="space-y-2 border-b border-gray-200 p-3">
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
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{selectedAssignment.label}</h2>
              <p className="text-sm text-gray-500">{selectedAssignment.id}</p>
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
