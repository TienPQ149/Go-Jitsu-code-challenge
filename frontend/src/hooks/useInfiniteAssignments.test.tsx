import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapper } from "../test/queryClientWrapper";

const mockListAssignments = vi.fn();
vi.mock("../api/assignments.api", () => ({
  listAssignments: (...args: unknown[]) => mockListAssignments(...args),
}));

import { useInfiniteAssignments } from "./useInfiniteAssignments";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useInfiniteAssignments", () => {
  it("fetches the first page with page size 50", async () => {
    mockListAssignments.mockResolvedValue({ data: Array(50).fill({}), total: 120 });

    const { result } = renderHook(() => useInfiniteAssignments("OPEN", ""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockListAssignments).toHaveBeenCalledWith({
      status: "OPEN",
      search: undefined,
      _page: 1,
      _per_page: 50,
    });
    expect(result.current.hasNextPage).toBe(true);
  });

  it("passes the search term through and reports no next page once fully loaded", async () => {
    mockListAssignments.mockResolvedValue({ data: Array(10).fill({}), total: 10 });

    const { result } = renderHook(() => useInfiniteAssignments("COMPLETED", "sony"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockListAssignments).toHaveBeenCalledWith({
      status: "COMPLETED",
      search: "sony",
      _page: 1,
      _per_page: 50,
    });
    expect(result.current.hasNextPage).toBe(false);
  });

  it("treats an empty status filter as 'no filter'", async () => {
    mockListAssignments.mockResolvedValue({ data: Array(5).fill({}), total: 5 });

    const { result } = renderHook(() => useInfiniteAssignments("", ""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockListAssignments).toHaveBeenCalledWith({
      status: undefined,
      search: undefined,
      _page: 1,
      _per_page: 50,
    });
  });

  it("fetches the next page when fetchNextPage is called", async () => {
    mockListAssignments
      .mockResolvedValueOnce({ data: Array(50).fill({}), total: 60 })
      .mockResolvedValueOnce({ data: Array(10).fill({}), total: 60 });

    const { result } = renderHook(() => useInfiniteAssignments("OPEN", ""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    result.current.fetchNextPage();

    await waitFor(() => expect(result.current.data?.pages.length).toBe(2));
    expect(mockListAssignments).toHaveBeenLastCalledWith({
      status: "OPEN",
      search: undefined,
      _page: 2,
      _per_page: 50,
    });
    expect(result.current.hasNextPage).toBe(false);
  });
});
