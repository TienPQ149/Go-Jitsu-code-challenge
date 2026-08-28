import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGET = vi.fn();
const mockPOST = vi.fn();
const mockPUT = vi.fn();
const mockPATCH = vi.fn();
const mockDELETE = vi.fn();

vi.mock("./client", () => ({
  apiClient: {
    GET: (...args: unknown[]) => mockGET(...args),
    POST: (...args: unknown[]) => mockPOST(...args),
    PUT: (...args: unknown[]) => mockPUT(...args),
    PATCH: (...args: unknown[]) => mockPATCH(...args),
    DELETE: (...args: unknown[]) => mockDELETE(...args),
  },
}));

import {
  createShipment,
  deleteShipment,
  getShipment,
  getValidTransitions,
  listShipments,
  transitionShipmentStatus,
  updateShipment,
} from "./shipments.api";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("shipments.api", () => {
  it("listShipments calls GET /shipments with query params and returns data", async () => {
    mockGET.mockResolvedValue({ data: { data: [], total: 0 }, error: undefined });

    const result = await listShipments({ status: "OPEN" });

    expect(mockGET).toHaveBeenCalledWith("/shipments", {
      params: { query: { status: "OPEN" } },
    });
    expect(result).toEqual({ data: [], total: 0 });
  });

  it("listShipments throws the API error when present", async () => {
    mockGET.mockResolvedValue({ data: undefined, error: { message: "boom" } });

    await expect(listShipments()).rejects.toEqual({ message: "boom" });
  });

  it("getShipment calls GET /shipments/{id} with a path param", async () => {
    mockGET.mockResolvedValue({ data: { id: "shp_001" }, error: undefined });

    const result = await getShipment("shp_001");

    expect(mockGET).toHaveBeenCalledWith("/shipments/{id}", {
      params: { path: { id: "shp_001" } },
    });
    expect(result).toEqual({ id: "shp_001" });
  });

  it("getValidTransitions calls the valid-transitions endpoint", async () => {
    mockGET.mockResolvedValue({
      data: { valid_target_statuses: ["IN_TRANSIT"] },
      error: undefined,
    });

    const result = await getValidTransitions("shp_001");

    expect(mockGET).toHaveBeenCalledWith("/shipments/{id}/valid-transitions", {
      params: { path: { id: "shp_001" } },
    });
    expect(result).toEqual({ valid_target_statuses: ["IN_TRANSIT"] });
  });

  it("createShipment posts the payload and returns the created shipment", async () => {
    mockPOST.mockResolvedValue({ data: { id: "shp_002" }, error: undefined });
    const payload = { client_name: "Acme", label: "L1" };

    const result = await createShipment(payload);

    expect(mockPOST).toHaveBeenCalledWith("/shipments", { body: payload });
    expect(result).toEqual({ id: "shp_002" });
  });

  it("updateShipment puts the payload against the path id", async () => {
    mockPUT.mockResolvedValue({ data: { id: "shp_001" }, error: undefined });

    const result = await updateShipment("shp_001", { lat: 1, lng: 2 });

    expect(mockPUT).toHaveBeenCalledWith("/shipments/{id}", {
      params: { path: { id: "shp_001" } },
      body: { lat: 1, lng: 2 },
    });
    expect(result).toEqual({ id: "shp_001" });
  });

  it("transitionShipmentStatus patches the status endpoint", async () => {
    mockPATCH.mockResolvedValue({
      data: { id: "shp_001", status: "IN_TRANSIT" },
      error: undefined,
    });

    const result = await transitionShipmentStatus("shp_001", {
      status: "IN_TRANSIT",
      assignment_id: "as_1",
    });

    expect(mockPATCH).toHaveBeenCalledWith("/shipments/{id}/status", {
      params: { path: { id: "shp_001" } },
      body: { status: "IN_TRANSIT", assignment_id: "as_1" },
    });
    expect(result).toEqual({ id: "shp_001", status: "IN_TRANSIT" });
  });

  it("deleteShipment calls DELETE and resolves with no value", async () => {
    mockDELETE.mockResolvedValue({ error: undefined });

    await expect(deleteShipment("shp_001")).resolves.toBeUndefined();
    expect(mockDELETE).toHaveBeenCalledWith("/shipments/{id}", {
      params: { path: { id: "shp_001" } },
    });
  });

  it("deleteShipment throws the API error when present", async () => {
    mockDELETE.mockResolvedValue({ error: { message: "not found" } });

    await expect(deleteShipment("shp_999")).rejects.toEqual({ message: "not found" });
  });
});
