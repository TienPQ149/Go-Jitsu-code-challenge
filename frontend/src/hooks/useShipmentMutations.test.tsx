import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestQueryClient } from "../test/queryClientWrapper";

const mockCreateShipment = vi.fn();
const mockUpdateShipment = vi.fn();
const mockTransitionShipmentStatus = vi.fn();
const mockDeleteShipment = vi.fn();

vi.mock("../api/shipments.api", () => ({
  createShipment: (...args: unknown[]) => mockCreateShipment(...args),
  updateShipment: (...args: unknown[]) => mockUpdateShipment(...args),
  transitionShipmentStatus: (...args: unknown[]) => mockTransitionShipmentStatus(...args),
  deleteShipment: (...args: unknown[]) => mockDeleteShipment(...args),
}));

import {
  useCreateShipment,
  useDeleteShipment,
  useTransitionShipmentStatus,
  useUpdateShipment,
} from "./useShipmentMutations";

beforeEach(() => {
  vi.clearAllMocks();
});

function wrapperFor(client: ReturnType<typeof createTestQueryClient>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useCreateShipment", () => {
  it("calls createShipment and invalidates queries on success", async () => {
    mockCreateShipment.mockResolvedValue({ id: "shp_new" });
    const client = createTestQueryClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useCreateShipment(), {
      wrapper: wrapperFor(client),
    });

    act(() => {
      result.current.mutate({ client_name: "Acme", label: "L1" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateShipment).toHaveBeenCalledWith({ client_name: "Acme", label: "L1" });
    expect(invalidateSpy).toHaveBeenCalled();
  });
});

describe("useUpdateShipment", () => {
  it("calls updateShipment with the bound id", async () => {
    mockUpdateShipment.mockResolvedValue({ id: "shp_001" });
    const client = createTestQueryClient();

    const { result } = renderHook(() => useUpdateShipment("shp_001"), {
      wrapper: wrapperFor(client),
    });

    act(() => {
      result.current.mutate({ lat: 1, lng: 2 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUpdateShipment).toHaveBeenCalledWith("shp_001", { lat: 1, lng: 2 });
  });
});

describe("useTransitionShipmentStatus", () => {
  it("calls transitionShipmentStatus with the bound id", async () => {
    mockTransitionShipmentStatus.mockResolvedValue({ id: "shp_001", status: "IN_TRANSIT" });
    const client = createTestQueryClient();

    const { result } = renderHook(() => useTransitionShipmentStatus("shp_001"), {
      wrapper: wrapperFor(client),
    });

    act(() => {
      result.current.mutate({ status: "IN_TRANSIT", assignment_id: "as_1" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockTransitionShipmentStatus).toHaveBeenCalledWith("shp_001", {
      status: "IN_TRANSIT",
      assignment_id: "as_1",
    });
  });
});

describe("useDeleteShipment", () => {
  it("calls deleteShipment with the given id and invalidates queries", async () => {
    mockDeleteShipment.mockResolvedValue(undefined);
    const client = createTestQueryClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useDeleteShipment(), {
      wrapper: wrapperFor(client),
    });

    act(() => {
      result.current.mutate("shp_001");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDeleteShipment).toHaveBeenCalledWith("shp_001");
    expect(invalidateSpy).toHaveBeenCalled();
  });
});
