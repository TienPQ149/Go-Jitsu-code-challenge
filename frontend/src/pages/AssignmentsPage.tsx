import { useNavigate, useSearch } from "@tanstack/react-router";
import { AssignmentListPanel } from "../components/assignments/AssignmentListPanel";
import { AssignmentDetailPanel } from "../components/assignments/AssignmentDetailPanel";

export function AssignmentsPage() {
  const search = useSearch({ from: "/assignments" });
  const navigate = useNavigate({ from: "/assignments" });

  const selectedId = search.selected;

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

  const handleDeselect = () => {
    navigate({ search: (prev) => ({ ...prev, selected: undefined }) });
  };

  return (
    <div className="flex h-full">
      <AssignmentListPanel
        search={search.search ?? ""}
        status={search.status ?? ""}
        selectedId={selectedId}
        onSelect={handleSelectAssignment}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <AssignmentDetailPanel assignmentId={selectedId} onDeleted={handleDeselect} />
      </div>
    </div>
  );
}
