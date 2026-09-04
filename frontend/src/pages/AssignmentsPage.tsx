import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import {
  useAssignment,
  useAssignments,
  useCreateAssignment,
  useDeleteAssignment,
  useAssignmentShipments,
} from "../hooks/useAssignments";
import { AssignmentListPanel } from "../components/assignments/AssignmentListPanel";
import { AssignmentDetailPanel } from "../components/assignments/AssignmentDetailPanel";

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
      <AssignmentListPanel
        assignments={assignments}
        isLoading={isLoading}
        isError={isError}
        selectedId={selectedId}
        onSelect={handleSelectAssignment}
        search={search.search ?? ""}
        status={search.status ?? ""}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        newLabel={newLabel}
        onNewLabelChange={setNewLabel}
        onCreateAssignment={handleCreateAssignment}
        isCreatePending={createAssignmentMutation.isPending}
        isCreateError={createAssignmentMutation.isError}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <AssignmentDetailPanel
          selectedId={selectedId}
          isLoadingAssignment={isLoadingAssignment}
          assignment={selectedAssignment}
          shipments={shipments}
          isLoadingShipments={isLoadingShipments}
          onDelete={handleDeleteAssignment}
          isDeletePending={deleteAssignmentMutation.isPending}
          isDeleteError={deleteAssignmentMutation.isError}
        />
      </div>
    </div>
  );
}
