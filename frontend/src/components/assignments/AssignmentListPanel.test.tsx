import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Assignment } from "../../types/domain";

const mockUseInfiniteAssignments = vi.fn();
const mockUseCreateAssignment = vi.fn();
const mockCreateMutate = vi.fn();

vi.mock("../../hooks/useInfiniteAssignments", () => ({
  useInfiniteAssignments: (...args: unknown[]) => mockUseInfiniteAssignments(...args),
}));
vi.mock("../../hooks/useAssignments", () => ({
  useCreateAssignment: (...args: unknown[]) => mockUseCreateAssignment(...args),
}));

import { AssignmentListPanel } from "./AssignmentListPanel";

function makeAssignment(id: string): Assignment {
  return {
    id,
    label: `Label-${id}`,
    status: "OPEN",
    shipment_count: 1,
    clients: ["Acme"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseCreateAssignment.mockReturnValue({
    mutate: mockCreateMutate,
    isPending: false,
    isError: false,
  });
});

describe("AssignmentListPanel", () => {
  it("shows the loading state", () => {
    mockUseInfiniteAssignments.mockReturnValue({
      data: undefined,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: true,
      isError: false,
    });

    render(
      <AssignmentListPanel
        search=""
        status=""
        selectedId={undefined}
        onSelect={vi.fn()}
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByText("Loading assignments…")).toBeInTheDocument();
  });

  it("shows the error state", () => {
    mockUseInfiniteAssignments.mockReturnValue({
      data: undefined,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: true,
    });

    render(
      <AssignmentListPanel
        search=""
        status=""
        selectedId={undefined}
        onSelect={vi.fn()}
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByText("Failed to load assignments.")).toBeInTheDocument();
  });

  it("shows an empty state when there are no assignments", () => {
    mockUseInfiniteAssignments.mockReturnValue({
      data: { pages: [{ data: [], total: 0 }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
    });

    render(
      <AssignmentListPanel
        search=""
        status=""
        selectedId={undefined}
        onSelect={vi.fn()}
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByText("No assignments found.")).toBeInTheDocument();
  });

  it("renders assignment rows and calls onSelect when a row is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    mockUseInfiniteAssignments.mockReturnValue({
      data: { pages: [{ data: [makeAssignment("as_1")], total: 1 }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
    });

    render(
      <AssignmentListPanel
        search=""
        status=""
        selectedId={undefined}
        onSelect={onSelect}
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByText("Label-as_1")).toBeInTheDocument();
    await user.click(screen.getByText("Label-as_1"));
    expect(onSelect).toHaveBeenCalledWith("as_1");
  });

  it("passes status/search to useInfiniteAssignments", () => {
    mockUseInfiniteAssignments.mockReturnValue({
      data: { pages: [{ data: [], total: 0 }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
    });

    render(
      <AssignmentListPanel
        search="tx"
        status="OPEN"
        selectedId={undefined}
        onSelect={vi.fn()}
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(mockUseInfiniteAssignments).toHaveBeenCalledWith("OPEN", "tx");
  });

  it("initializes the search input from the search prop", () => {
    mockUseInfiniteAssignments.mockReturnValue({
      data: { pages: [{ data: [], total: 0 }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
    });

    render(
      <AssignmentListPanel
        search="sony"
        status=""
        selectedId={undefined}
        onSelect={vi.fn()}
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText("Search assignments...")).toHaveValue("sony");
  });

  it("debounces search input changes before querying and calling onSearchChange", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    mockUseInfiniteAssignments.mockReturnValue({
      data: { pages: [{ data: [], total: 0 }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
    });

    render(
      <AssignmentListPanel
        search=""
        status=""
        selectedId={undefined}
        onSelect={vi.fn()}
        onSearchChange={onSearchChange}
        onStatusChange={vi.fn()}
      />
    );

    await waitFor(() => expect(onSearchChange).toHaveBeenCalledWith(""));
    onSearchChange.mockClear();
    mockUseInfiniteAssignments.mockClear();

    await user.type(screen.getByPlaceholderText("Search assignments..."), "sony");

    // Typing shouldn't immediately re-query or navigate before the debounce fires.
    expect(mockUseInfiniteAssignments).not.toHaveBeenCalledWith("", "sony");
    expect(onSearchChange).not.toHaveBeenCalledWith("sony");

    await waitFor(() => expect(onSearchChange).toHaveBeenLastCalledWith("sony"), {
      timeout: 1000,
    });
    expect(mockUseInfiniteAssignments).toHaveBeenLastCalledWith("", "sony");
  });

  it("creates a new assignment and selects it on success", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    mockCreateMutate.mockImplementation((_payload, options) => {
      options.onSuccess({ id: "as_new" });
    });
    mockUseInfiniteAssignments.mockReturnValue({
      data: { pages: [{ data: [], total: 0 }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
    });

    render(
      <AssignmentListPanel
        search=""
        status=""
        selectedId={undefined}
        onSelect={onSelect}
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("New assignment label"), "TX-999");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(mockCreateMutate).toHaveBeenCalledWith(
      { label: "TX-999" },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(onSelect).toHaveBeenCalledWith("as_new");
  });
});
