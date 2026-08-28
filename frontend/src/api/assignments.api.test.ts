import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGET = vi.fn();
const mockPOST = vi.fn();
const mockDELETE = vi.fn();

vi.mock("./client", () => ({
  apiClient: {
    GET: (...args: unknown[]) => mockGET(...args),
    POST: (...args: unknown[]) => mockPOST(...args),
    DELETE: (...args: unknown[]) => mockDELETE(...args),
  },
}));

import {
  createAssignment,
  deleteAssignment,
  getAssignment,
  getAssignmentShipments,
  listAssignments,
} from "./assignments.api";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("assignments.api", () => {
  it("listAssignments calls GET /assignments with query params", async () => {
    mockGET.mockResolvedValue({ data: [{ id: "as_1" }], error: undefined });

    const result = await listAssignments({ status: "OPEN" });

    expect(mockGET).toHaveBeenCalledWith("/assignments", {
      params: { query: { status: "OPEN" } },
    });
    expect(result).toEqual([{ id: "as_1" }]);
  });

  it("listAssignments throws the API error when present", async () => {
    mockGET.mockResolvedValue({ data: undefined, error: { message: "boom" } });

    await expect(listAssignments()).rejects.toEqual({ message: "boom" });
  });

  it("getAssignment calls GET /assignments/{id}", async () => {
    mockGET.mockResolvedValue({ data: { id: "as_1" }, error: undefined });

    const result = await getAssignment("as_1");

    expect(mockGET).toHaveBeenCalledWith("/assignments/{id}", {
      params: { path: { id: "as_1" } },
    });
    expect(result).toEqual({ id: "as_1" });
  });

  it("getAssignmentShipments calls GET /assignments/{id}/shipments", async () => {
    mockGET.mockResolvedValue({ data: [{ id: "shp_1" }], error: undefined });

    const result = await getAssignmentShipments("as_1");

    expect(mockGET).toHaveBeenCalledWith("/assignments/{id}/shipments", {
      params: { path: { id: "as_1" } },
    });
    expect(result).toEqual([{ id: "shp_1" }]);
  });

  it("createAssignment posts the payload", async () => {
    mockPOST.mockResolvedValue({ data: { id: "as_new" }, error: undefined });
    const payload = { label: "A1" };

    const result = await createAssignment(payload);

    expect(mockPOST).toHaveBeenCalledWith("/assignments", { body: payload });
    expect(result).toEqual({ id: "as_new" });
  });

  it("deleteAssignment calls DELETE and resolves with no value", async () => {
    mockDELETE.mockResolvedValue({ error: undefined });

    await expect(deleteAssignment("as_1")).resolves.toBeUndefined();
    expect(mockDELETE).toHaveBeenCalledWith("/assignments/{id}", {
      params: { path: { id: "as_1" } },
    });
  });

  it("deleteAssignment throws the API error when present", async () => {
    mockDELETE.mockResolvedValue({ error: { message: "not found" } });

    await expect(deleteAssignment("as_999")).rejects.toEqual({ message: "not found" });
  });
});
