import { apiClient } from "./client";
import type { AssignmentStatus } from "../types/domain";

export interface ListAssignmentsParams {
  status?: AssignmentStatus;
  search?: string;
  _page?: number;
  _per_page?: number;
}

export async function listAssignments(params: ListAssignmentsParams = {}) {
  const { data, error } = await apiClient.GET("/assignments", {
    params: { query: params },
  });
  if (error) throw error;
  return data;
}

export async function getAssignment(id: string) {
  const { data, error } = await apiClient.GET("/assignments/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

export async function getAssignmentShipments(id: string) {
  const { data, error } = await apiClient.GET("/assignments/{id}/shipments", {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

export interface CreateAssignmentPayload {
  label: string;
  status?: AssignmentStatus;
  clients?: string[];
}

export async function createAssignment(payload: CreateAssignmentPayload) {
  const { data, error } = await apiClient.POST("/assignments", {
    body: payload,
  });
  if (error) throw error;
  return data;
}

export async function deleteAssignment(id: string) {
  const { error } = await apiClient.DELETE("/assignments/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
}
