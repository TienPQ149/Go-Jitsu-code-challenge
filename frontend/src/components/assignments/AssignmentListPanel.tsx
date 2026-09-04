import type { Assignment } from "../../types/domain";
import { AssignmentRow } from "./AssignmentRow";
import { AssignmentFilters } from "./AssignmentFilters";
import { CreateAssignmentForm } from "./CreateAssignmentForm";

type AssignmentStatusFilter = "OPEN" | "COMPLETED" | "";

interface AssignmentListPanelProps {
  assignments: Assignment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedId: string | undefined;
  onSelect: (id: string) => void;

  search: string;
  status: AssignmentStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AssignmentStatusFilter) => void;

  newLabel: string;
  onNewLabelChange: (value: string) => void;
  onCreateAssignment: () => void;
  isCreatePending: boolean;
  isCreateError: boolean;
}

export function AssignmentListPanel({
  assignments,
  isLoading,
  isError,
  selectedId,
  onSelect,
  search,
  status,
  onSearchChange,
  onStatusChange,
  newLabel,
  onNewLabelChange,
  onCreateAssignment,
  isCreatePending,
  isCreateError,
}: AssignmentListPanelProps) {
  return (
    <div className="w-96 shrink-0 border-r border-gray-200">
      <div className="space-y-2 border-b border-gray-200 p-3">
        <CreateAssignmentForm
          value={newLabel}
          onChange={onNewLabelChange}
          onSubmit={onCreateAssignment}
          isPending={isCreatePending}
          isError={isCreateError}
        />
        <AssignmentFilters
          search={search}
          status={status}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
        />
      </div>

      <div className="h-[calc(100vh-114px)] overflow-y-auto">
        {isLoading && <p className="p-3 text-sm text-gray-400">Loading assignments…</p>}
        {isError && <p className="p-3 text-sm text-red-600">Failed to load assignments.</p>}

        {!isLoading && !isError && assignments?.length === 0 && (
          <p className="p-3 text-sm text-gray-400">No assignments found.</p>
        )}

        {assignments?.map((assignment) => (
          <AssignmentRow
            key={assignment.id}
            assignment={assignment}
            isSelected={selectedId === assignment.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
