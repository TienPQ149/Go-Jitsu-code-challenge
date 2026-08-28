import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAssignment,
  deleteAssignment,
  getAssignment,
  getAssignmentShipments,
  listAssignments,
  type CreateAssignmentPayload,
  type ListAssignmentsParams,
} from "../api/assignments.api";
import { queryKeys } from "./queryKeys";

export function useAssignments(params: ListAssignmentsParams = {}) {
  return useQuery({
    queryKey: queryKeys.assignments.list(params),
    queryFn: () => listAssignments(params),
  });
}

export function useAssignment(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assignments.detail(id ?? ""),
    queryFn: () => getAssignment(id as string),
    enabled: Boolean(id),
  });
}

export function useAssignmentShipments(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assignments.shipments(id ?? ""),
    queryFn: () => getAssignmentShipments(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => createAssignment(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.lists() }),
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssignment(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.lists() }),
  });
}
