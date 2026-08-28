import { apiClient } from "./client";
import type { ShipmentStatus } from "../types/domain";

export interface ListShipmentsParams {
  status?: ShipmentStatus;
  search?: string;
  _page?: number;
  _per_page?: number;
}

export async function listShipments(params: ListShipmentsParams = {}) {
  const { data, error } = await apiClient.GET("/shipments", {
    params: { query: params },
  });
  if (error) throw error;
  return data;
}

export async function getShipment(id: string) {
  const { data, error } = await apiClient.GET("/shipments/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

export async function getValidTransitions(id: string) {
  const { data, error } = await apiClient.GET("/shipments/{id}/valid-transitions", {
    params: { path: { id } },
  });
  if (error) throw error;
  return data;
}

export interface CreateShipmentPayload {
  client_name: string;
  label: string;
  status?: ShipmentStatus;
  arrival_date?: string;
  delivery_by_date?: string;
  eta?: string;
  warehouse_id?: string;
  assignment_id?: string | null;
  lat?: number;
  lng?: number;
}

export async function createShipment(payload: CreateShipmentPayload) {
  const { data, error } = await apiClient.POST("/shipments", {
    body: payload,
  });
  if (error) throw error;
  return data;
}

export interface UpdateShipmentPayload {
  delivery_by_date?: string;
  lat?: number;
  lng?: number;
}

export async function updateShipment(id: string, payload: UpdateShipmentPayload) {
  const { data, error } = await apiClient.PUT("/shipments/{id}", {
    params: { path: { id } },
    body: payload,
  });
  if (error) throw error;
  return data;
}

export interface TransitionShipmentStatusPayload {
  status: ShipmentStatus;
  assignment_id?: string | null;
}

export async function transitionShipmentStatus(
  id: string,
  payload: TransitionShipmentStatusPayload
) {
  const { data, error } = await apiClient.PATCH("/shipments/{id}/status", {
    params: { path: { id } },
    body: payload,
  });
  if (error) throw error;
  return data;
}

export async function deleteShipment(id: string) {
  const { error } = await apiClient.DELETE("/shipments/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
}
