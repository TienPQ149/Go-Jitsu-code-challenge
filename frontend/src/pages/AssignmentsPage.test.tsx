import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockNavigate = vi.fn();
const mockUseSearch = vi.fn();
const mockUseNavigate = vi.fn();
const mockUseAssignments = vi.fn();
const mockUseAssignment = vi.fn();
const mockUseAssignmentShipments = vi.fn();
const mockUseCreateAssignment = vi.fn();
const mockUseDeleteAssignment = vi.fn();
const mockCreateMutate = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useSearch: (...args: unknown[]) => mockUseSearch(...args),
  useNavigate: (...args: unknown[]) => mockUseNavigate(...args),
}));

vi.mock("../hooks/useAssignments", () => ({
  useAssignments: (...args: unknown[]) => mockUseAssignments(...args),
  useAssignment: (...args: unknown[]) => mockUseAssignment(...args),
  useAssignmentShipments: (...args: unknown[]) => mockUseAssignmentShipments(...args),
  useCreateAssignment: (...args: unknown[]) => mockUseCreateAssignment(...args),
  useDeleteAssignment: (...args: unknown[]) => mockUseDeleteAssignment(...args),
}));

import { AssignmentsPage } from "./AssignmentsPage";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, "confirm").mockReturnValue(true);
  mockUseSearch.mockReturnValue({
    status: undefined,
    search: undefined,
    selected: undefined,
  });
  mockUseNavigate.mockReturnValue(mockNavigate);
  mockUseAssignments.mockReturnValue({ data: [], isLoading: false, isError: false });
  mockUseAssignment.mockReturnValue({ data: undefined, isLoading: false });
  mockUseAssignmentShipments.mockReturnValue({ data: [], isLoading: false });
  mockUseCreateAssignment.mockReturnValue({
    mutate: mockCreateMutate,
    isPending: false,
    isError: false,
  });
  mockUseDeleteAssignment.mockReturnValue({
    mutate: mockDeleteMutate,
    isPending: false,
    isError: false,
  });
});

describe("AssignmentsPage", () => {
  it("passes status/search params from URL to useAssignments", () => {
    mockUseSearch.mockReturnValue({
      status: "OPEN",
      search: "tx",
      selected: undefined,
    });

    render(<AssignmentsPage />);

    expect(mockUseAssignments).toHaveBeenCalledWith({ status: "OPEN", search: "tx" });
  });

  it("shows loading state for assignments list", () => {
    mockUseAssignments.mockReturnValue({ data: [], isLoading: true, isError: false });

    render(<AssignmentsPage />);

    expect(screen.getByText("Loading assignments…")).toBeInTheDocument();
  });

  it("shows error state for assignments list", () => {
    mockUseAssignments.mockReturnValue({ data: [], isLoading: false, isError: true });

    render(<AssignmentsPage />);

    expect(screen.getByText("Failed to load assignments.")).toBeInTheDocument();
  });

  it("shows empty state when assignments list is empty", () => {
    mockUseAssignments.mockReturnValue({ data: [], isLoading: false, isError: false });

    render(<AssignmentsPage />);

    expect(screen.getByText("No assignments found.")).toBeInTheDocument();
  });

  it("navigates when search input changes", async () => {
    render(<AssignmentsPage />);

    fireEvent.change(screen.getByPlaceholderText("Search assignments..."), {
      target: { value: "sony" },
    });

    const lastCall = mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1][0];
    const searchFn = lastCall.search;
    expect(searchFn({ status: "OPEN", selected: "as_1" })).toEqual({
      status: "OPEN",
      selected: "as_1",
      search: "sony",
    });
  });

  it("navigates when status filter changes and clears selected", async () => {
    const user = userEvent.setup();
    render(<AssignmentsPage />);

    await user.selectOptions(screen.getByRole("combobox"), "OPEN");

    const lastCall = mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1][0];
    const searchFn = lastCall.search;
    expect(searchFn({ search: "tx", selected: "as_1" })).toEqual({
      search: "tx",
      status: "OPEN",
      selected: undefined,
    });
  });

  it("renders assignment rows and selects one on click", async () => {
    const user = userEvent.setup();
    mockUseAssignments.mockReturnValue({
      data: [
        {
          id: "as_1",
          label: "TX-127",
          status: "OPEN",
          shipment_count: 2,
          clients: ["Acme", "Sony"],
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(<AssignmentsPage />);

    expect(screen.getByText("TX-127")).toBeInTheDocument();
    expect(screen.getByText("2 shipments · 2 clients")).toBeInTheDocument();

    await user.click(screen.getByText("TX-127"));
    const lastCall = mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1][0];
    expect(lastCall.search({ search: "tx" })).toEqual({ search: "tx", selected: "as_1" });
  });

  it("shows placeholder in right panel when nothing selected", () => {
    render(<AssignmentsPage />);

    expect(screen.getByText("Select an assignment to see details.")).toBeInTheDocument();
  });

  it("shows loading for selected assignment", () => {
    mockUseSearch.mockReturnValue({ selected: "as_1", status: undefined, search: undefined });
    mockUseAssignment.mockReturnValue({ data: undefined, isLoading: true });

    render(<AssignmentsPage />);

    expect(screen.getByText("Loading assignment…")).toBeInTheDocument();
  });

  it("shows assignment details and related shipments", () => {
    mockUseSearch.mockReturnValue({ selected: "as_1", status: undefined, search: undefined });
    mockUseAssignment.mockReturnValue({
      data: {
        id: "as_1",
        label: "TX-127",
        status: "OPEN",
        shipment_count: 2,
        clients: ["Acme", "Sony"],
      },
      isLoading: false,
    });
    mockUseAssignmentShipments.mockReturnValue({
      data: [
        { id: "shp_1", label: "LAX-1", client_name: "Acme", status: "OPEN" },
        { id: "shp_2", label: "LAX-2", client_name: "Sony", status: "IN_TRANSIT" },
      ],
      isLoading: false,
    });

    render(<AssignmentsPage />);

    expect(screen.getByText("TX-127")).toBeInTheDocument();
    expect(screen.getByText("Acme, Sony")).toBeInTheDocument();
    expect(screen.getByText("LAX-1")).toBeInTheDocument();
    expect(screen.getByText("LAX-2")).toBeInTheDocument();
  });

  it("shows fallback when selected assignment has no shipments", () => {
    mockUseSearch.mockReturnValue({ selected: "as_1", status: undefined, search: undefined });
    mockUseAssignment.mockReturnValue({
      data: {
        id: "as_1",
        label: "TX-127",
        status: "OPEN",
        shipment_count: 0,
        clients: [],
      },
      isLoading: false,
    });
    mockUseAssignmentShipments.mockReturnValue({ data: [], isLoading: false });

    render(<AssignmentsPage />);

    expect(screen.getByText("No shipments in this assignment.")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("creates a new assignment and selects it on success", async () => {
    const user = userEvent.setup();
    mockCreateMutate.mockImplementation((_payload, options) => {
      options.onSuccess({ id: "as_new" });
    });

    render(<AssignmentsPage />);

    await user.type(screen.getByPlaceholderText("New assignment label"), "TX-999");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(mockCreateMutate).toHaveBeenCalledWith(
      { label: "TX-999" },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );

    const lastCall = mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1][0];
    expect(lastCall.search({ search: "abc" })).toEqual({ search: "abc", selected: "as_new" });
  });

  it("deletes selected assignment when empty and confirmed", async () => {
    const user = userEvent.setup();
    mockDeleteMutate.mockImplementation((_id, options) => {
      options.onSuccess();
    });
    mockUseSearch.mockReturnValue({ selected: "as_1", status: undefined, search: undefined });
    mockUseAssignment.mockReturnValue({
      data: {
        id: "as_1",
        label: "TX-127",
        status: "OPEN",
        shipment_count: 0,
        clients: [],
      },
      isLoading: false,
    });

    render(<AssignmentsPage />);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteMutate).toHaveBeenCalledWith(
      "as_1",
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    const lastCall = mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1][0];
    expect(lastCall.search({ selected: "as_1", search: "abc" })).toEqual({
      selected: undefined,
      search: "abc",
    });
  });

  it("disables delete button when selected assignment still has shipments", () => {
    mockUseSearch.mockReturnValue({ selected: "as_1", status: undefined, search: undefined });
    mockUseAssignment.mockReturnValue({
      data: {
        id: "as_1",
        label: "TX-127",
        status: "OPEN",
        shipment_count: 2,
        clients: ["A"],
      },
      isLoading: false,
    });

    render(<AssignmentsPage />);

    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });
});
