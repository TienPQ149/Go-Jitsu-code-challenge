import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapper } from "../test/queryClientWrapper";

const mockGetShipment = vi.fn();
const mockGetValidTransitions = vi.fn();
vi.mock("../api/shipments.api", () => ({
  getShipment: (...args: unknown[]) => mockGetShipment(...args),
  getValidTransitions: (...args: unknown[]) => mockGetValidTransitions(...args),
}));

import { useShipment, useValidTransitions } from "./useShipment";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useShipment", () => {
  it("does not fetch when id is undefined", () => {
    const { result } = renderHook(() => useShipment(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetShipment).not.toHaveBeenCalled();
  });

  it("fetches the shipment when id is provided", async () => {
    mockGetShipment.mockResolvedValue({ id: "shp_001" });

    const { result } = renderHook(() => useShipment("shp_001"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetShipment).toHaveBeenCalledWith("shp_001");
    expect(result.current.data).toEqual({ id: "shp_001" });
  });
});

describe("useValidTransitions", () => {
  it("does not fetch when id is undefined", () => {
    const { result } = renderHook(() => useValidTransitions(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetValidTransitions).not.toHaveBeenCalled();
  });

  it("fetches valid transitions when id is provided", async () => {
    mockGetValidTransitions.mockResolvedValue({ valid_target_statuses: ["IN_TRANSIT"] });

    const { result } = renderHook(() => useValidTransitions("shp_001"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetValidTransitions).toHaveBeenCalledWith("shp_001");
    expect(result.current.data).toEqual({ valid_target_statuses: ["IN_TRANSIT"] });
  });
});
