import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapper } from "../test/queryClientWrapper";

const mockListShipments = vi.fn();
vi.mock("../api/shipments.api", () => ({
  listShipments: (...args: unknown[]) => mockListShipments(...args),
}));

import { useInfiniteShipments } from "./useInfiniteShipments";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useInfiniteShipments", () => {
  it("fetches the first page with page size 50", async () => {
    mockListShipments.mockResolvedValue({ data: Array(50).fill({}), total: 120 });

    const { result } = renderHook(() => useInfiniteShipments("OPEN", ""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockListShipments).toHaveBeenCalledWith({
      status: "OPEN",
      search: undefined,
      _page: 1,
      _per_page: 50,
    });
    expect(result.current.hasNextPage).toBe(true);
  });

  it("passes the search term through and reports no next page once fully loaded", async () => {
    mockListShipments.mockResolvedValue({ data: Array(10).fill({}), total: 10 });

    const { result } = renderHook(() => useInfiniteShipments("DELIVERED", "sony"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockListShipments).toHaveBeenCalledWith({
      status: "DELIVERED",
      search: "sony",
      _page: 1,
      _per_page: 50,
    });
    expect(result.current.hasNextPage).toBe(false);
  });

  it("fetches the next page when fetchNextPage is called", async () => {
    mockListShipments
      .mockResolvedValueOnce({ data: Array(50).fill({}), total: 60 })
      .mockResolvedValueOnce({ data: Array(10).fill({}), total: 60 });

    const { result } = renderHook(() => useInfiniteShipments("OPEN", ""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    result.current.fetchNextPage();

    await waitFor(() => expect(result.current.data?.pages.length).toBe(2));
    expect(mockListShipments).toHaveBeenLastCalledWith({
      status: "OPEN",
      search: undefined,
      _page: 2,
      _per_page: 50,
    });
    expect(result.current.hasNextPage).toBe(false);
  });
});
