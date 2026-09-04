import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseAssignment = vi.fn();
const mockUseAssignmentShipments = vi.fn();
const mockUseDeleteAssignment = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock("../../hooks/useAssignments", () => ({
  useAssignment: (...args: unknown[]) => mockUseAssignment(...args),
  useAssignmentShipments: (...args: unknown[]) => mockUseAssignmentShipments(...args),
  useDeleteAssignment: (...args: unknown[]) => mockUseDeleteAssignment(...args),
}));

import { AssignmentDetailPanel } from "./AssignmentDetailPanel";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, "confirm").mockReturnValue(true);
  mockUseDeleteAssignment.mockReturnValue({
    mutate: mockDeleteMutate,
    isPending: false,
    isError: false,
  });
});

describe("AssignmentDetailPanel", () => {
  it("shows a placeholder when no assignment is selected", () => {
    mockUseAssignment.mockReturnValue({ data: undefined, isLoading: false });
    mockUseAssignmentShipments.mockReturnValue({ data: [], isLoading: false });

    render(<AssignmentDetailPanel assignmentId={undefined} onDeleted={vi.fn()} />);

    expect(screen.getByText("Select an assignment to see details.")).toBeInTheDocument();
  });

  it("shows a loading state", () => {
    mockUseAssignment.mockReturnValue({ data: undefined, isLoading: true });
    mockUseAssignmentShipments.mockReturnValue({ data: [], isLoading: false });

    render(<AssignmentDetailPanel assignmentId="as_1" onDeleted={vi.fn()} />);

    expect(screen.getByText("Loading assignment…")).toBeInTheDocument();
  });

  it("shows a not-found state", () => {
    mockUseAssignment.mockReturnValue({ data: undefined, isLoading: false });
    mockUseAssignmentShipments.mockReturnValue({ data: [], isLoading: false });

    render(<AssignmentDetailPanel assignmentId="as_1" onDeleted={vi.fn()} />);

    expect(screen.getByText("Assignment not found.")).toBeInTheDocument();
  });

  it("shows assignment details and related shipments", () => {
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

    render(<AssignmentDetailPanel assignmentId="as_1" onDeleted={vi.fn()} />);

    expect(screen.getByText("TX-127")).toBeInTheDocument();
    expect(screen.getByText("Acme, Sony")).toBeInTheDocument();
    expect(screen.getByText("LAX-1")).toBeInTheDocument();
    expect(screen.getByText("LAX-2")).toBeInTheDocument();
  });

  it("shows fallback when the assignment has no shipments", () => {
    mockUseAssignment.mockReturnValue({
      data: { id: "as_1", label: "TX-127", status: "OPEN", shipment_count: 0, clients: [] },
      isLoading: false,
    });
    mockUseAssignmentShipments.mockReturnValue({ data: [], isLoading: false });

    render(<AssignmentDetailPanel assignmentId="as_1" onDeleted={vi.fn()} />);

    expect(screen.getByText("No shipments in this assignment.")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("deletes the assignment when empty and confirmed", async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    mockDeleteMutate.mockImplementation((_id, options) => {
      options.onSuccess();
    });
    mockUseAssignment.mockReturnValue({
      data: { id: "as_1", label: "TX-127", status: "OPEN", shipment_count: 0, clients: [] },
      isLoading: false,
    });
    mockUseAssignmentShipments.mockReturnValue({ data: [], isLoading: false });

    render(<AssignmentDetailPanel assignmentId="as_1" onDeleted={onDeleted} />);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteMutate).toHaveBeenCalledWith(
      "as_1",
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(onDeleted).toHaveBeenCalled();
  });

  it("disables delete button when the assignment still has shipments", () => {
    mockUseAssignment.mockReturnValue({
      data: { id: "as_1", label: "TX-127", status: "OPEN", shipment_count: 2, clients: ["A"] },
      isLoading: false,
    });
    mockUseAssignmentShipments.mockReturnValue({ data: [], isLoading: false });

    render(<AssignmentDetailPanel assignmentId="as_1" onDeleted={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });
});
