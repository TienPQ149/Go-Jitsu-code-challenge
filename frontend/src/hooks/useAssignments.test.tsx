import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapper } from "../test/queryClientWrapper";

const mockListAssignments = vi.fn();
const mockGetAssignment = vi.fn();
const mockGetAssignmentShipments = vi.fn();
const mockCreateAssignment = vi.fn();
const mockDeleteAssignment = vi.fn();

vi.mock("../api/assignments.api", () => ({
  listAssignments: (...args: unknown[]) => mockListAssignments(...args),
  getAssignment: (...args: unknown[]) => mockGetAssignment(...args),
  getAssignmentShipments: (...args: unknown[]) => mockGetAssignmentShipments(...args),
  createAssignment: (...args: unknown[]) => mockCreateAssignment(...args),
  deleteAssignment: (...args: unknown[]) => mockDeleteAssignment(...args),
}));

import {
  useAssignment,
  useAssignments,
  useAssignmentShipments,
  useCreateAssignment,
  useDeleteAssignment,
} from "./useAssignments";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useAssignments", () => {
  it("lists assignments with the given params", async () => {
    mockListAssignments.mockResolvedValue([{ id: "as_1" }]);

    const { result } = renderHook(() => useAssignments({ status: "OPEN" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockListAssignments).toHaveBeenCalledWith({ status: "OPEN" });
    expect(result.current.data).toEqual([{ id: "as_1" }]);
  });
});

describe("useAssignment", () => {
  it("does not fetch when id is undefined", () => {
    const { result } = renderHook(() => useAssignment(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetAssignment).not.toHaveBeenCalled();
  });

  it("fetches when id is provided", async () => {
    mockGetAssignment.mockResolvedValue({ id: "as_1" });

    const { result } = renderHook(() => useAssignment("as_1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetAssignment).toHaveBeenCalledWith("as_1");
  });
});

describe("useAssignmentShipments", () => {
  it("fetches shipments for an assignment when id is provided", async () => {
    mockGetAssignmentShipments.mockResolvedValue([{ id: "shp_1" }]);

    const { result } = renderHook(() => useAssignmentShipments("as_1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetAssignmentShipments).toHaveBeenCalledWith("as_1");
  });
});

describe("useCreateAssignment", () => {
  it("calls createAssignment", async () => {
    mockCreateAssignment.mockResolvedValue({ id: "as_new" });

    const { result } = renderHook(() => useCreateAssignment(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ label: "A1" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateAssignment).toHaveBeenCalledWith({ label: "A1" });
  });
});

describe("useDeleteAssignment", () => {
  it("calls deleteAssignment with the given id", async () => {
    mockDeleteAssignment.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteAssignment(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("as_1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDeleteAssignment).toHaveBeenCalledWith("as_1");
  });
});
