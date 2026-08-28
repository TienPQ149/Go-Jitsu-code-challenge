import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapper } from "../test/queryClientWrapper";

const mockListShipments = vi.fn();
vi.mock("../api/shipments.api", () => ({
  listShipments: (...args: unknown[]) => mockListShipments(...args),
}));

import { useShipments } from "./useShipments";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useShipments", () => {
  it("fetches shipments using the given params", async () => {
    mockListShipments.mockResolvedValue({ data: [], total: 0 });

    const { result } = renderHook(() => useShipments({ status: "OPEN" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockListShipments).toHaveBeenCalledWith({ status: "OPEN" });
    expect(result.current.data).toEqual({ data: [], total: 0 });
  });

  it("surfaces errors from the API", async () => {
    mockListShipments.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useShipments({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
