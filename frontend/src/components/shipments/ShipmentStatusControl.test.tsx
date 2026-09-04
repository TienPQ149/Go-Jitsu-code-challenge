import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Shipment } from "../../types/domain";

const mockUseValidTransitions = vi.fn();
const mockUseAssignments = vi.fn();
const mockMutate = vi.fn();
const mockUseTransitionShipmentStatus = vi.fn();

vi.mock("../../hooks/useShipment", () => ({
  useValidTransitions: (...args: unknown[]) => mockUseValidTransitions(...args),
}));
vi.mock("../../hooks/useAssignments", () => ({
  useAssignments: (...args: unknown[]) => mockUseAssignments(...args),
}));
vi.mock("../../hooks/useShipmentMutations", () => ({
  useTransitionShipmentStatus: (...args: unknown[]) => mockUseTransitionShipmentStatus(...args),
}));

import { ShipmentStatusControl } from "./ShipmentStatusControl";

const shipment: Shipment = {
  id: "shp_001",
  label: "L1",
  client_name: "Acme",
  status: "OPEN",
  arrival_date: "2026-01-01T00:00:00.000Z",
  eta: "2026-01-02T00:00:00.000Z",
  warehouse_id: "581",
  delivery_by_date: "2026-01-03T00:00:00.000Z",
  lat: 1,
  lng: 2,
  assignment_id: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseTransitionShipmentStatus.mockReturnValue({
    mutate: mockMutate,
    isPending: false,
    isError: false,
  });
});

describe("ShipmentStatusControl", () => {
  it("shows a message when there are no further transitions", () => {
    mockUseValidTransitions.mockReturnValue({ data: { valid_target_statuses: [] } });
    mockUseAssignments.mockReturnValue({ data: { data: [], total: 0, page: 1, per_page: 1 } });

    render(<ShipmentStatusControl shipment={shipment} />);

    expect(screen.getByText("No further transitions available.")).toBeInTheDocument();
  });

  it("lists valid target statuses in the dropdown", () => {
    mockUseValidTransitions.mockReturnValue({
      data: { valid_target_statuses: ["IN_TRANSIT"] },
    });
    mockUseAssignments.mockReturnValue({ data: { data: [], total: 0, page: 1, per_page: 1 } });

    render(<ShipmentStatusControl shipment={shipment} />);

    expect(screen.getByRole("option", { name: "IN_TRANSIT" })).toBeInTheDocument();
  });

  it("shows the assignment picker only after selecting IN_TRANSIT", async () => {
    const user = userEvent.setup();
    mockUseValidTransitions.mockReturnValue({
      data: { valid_target_statuses: ["IN_TRANSIT"] },
    });
    mockUseAssignments.mockReturnValue({ data: { data: [{ id: "as_1", label: "A1" }], total: 1, page: 1, per_page: 1 } });

    render(<ShipmentStatusControl shipment={shipment} />);

    expect(screen.queryByText("Select an assignment…")).not.toBeInTheDocument();

    await user.selectOptions(screen.getAllByRole("combobox")[0], "IN_TRANSIT");

    expect(screen.getByText("Select an assignment…")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "A1" })).toBeInTheDocument();
  });

  it("disables Apply until a target status (and assignment when needed) is chosen", async () => {
    const user = userEvent.setup();
    mockUseValidTransitions.mockReturnValue({
      data: { valid_target_statuses: ["IN_TRANSIT"] },
    });
    mockUseAssignments.mockReturnValue({ data: { data: [{ id: "as_1", label: "A1" }], total: 1, page: 1, per_page: 1 } });

    render(<ShipmentStatusControl shipment={shipment} />);

    const applyButton = screen.getByRole("button", { name: "Apply transition" });
    expect(applyButton).toBeDisabled();

    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "IN_TRANSIT");
    expect(applyButton).toBeDisabled();

    await user.selectOptions(screen.getAllByRole("combobox")[1], "as_1");
    expect(applyButton).not.toBeDisabled();
  });

  it("calls the transition mutation with status + assignment on Apply", async () => {
    const user = userEvent.setup();
    mockUseValidTransitions.mockReturnValue({
      data: { valid_target_statuses: ["IN_TRANSIT"] },
    });
    mockUseAssignments.mockReturnValue({ data: { data: [{ id: "as_1", label: "A1" }], total: 1, page: 1, per_page: 1 } });

    render(<ShipmentStatusControl shipment={shipment} />);

    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "IN_TRANSIT");
    await user.selectOptions(screen.getAllByRole("combobox")[1], "as_1");
    await user.click(screen.getByRole("button", { name: "Apply transition" }));

    expect(mockMutate).toHaveBeenCalledWith(
      { status: "IN_TRANSIT", assignment_id: "as_1" },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it("does not require an assignment for transitions other than IN_TRANSIT", async () => {
    const user = userEvent.setup();
    mockUseValidTransitions.mockReturnValue({
      data: { valid_target_statuses: ["DELIVERED"] },
    });
    mockUseAssignments.mockReturnValue({ data: { data: [], total: 0, page: 1, per_page: 1 } });

    render(<ShipmentStatusControl shipment={{ ...shipment, status: "IN_TRANSIT" }} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "DELIVERED");
    const applyButton = screen.getByRole("button", { name: "Apply transition" });
    expect(applyButton).not.toBeDisabled();

    await user.click(applyButton);
    expect(mockMutate).toHaveBeenCalledWith(
      { status: "DELIVERED", assignment_id: undefined },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it("shows an error message when the transition mutation fails", () => {
    mockUseValidTransitions.mockReturnValue({
      data: { valid_target_statuses: ["IN_TRANSIT"] },
    });
    mockUseAssignments.mockReturnValue({ data: { data: [], total: 0, page: 1, per_page: 1 } });
    mockUseTransitionShipmentStatus.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: true,
      error: { error: "Invalid transition" },
    });

    render(<ShipmentStatusControl shipment={shipment} />);

    expect(screen.getByText("Invalid transition")).toBeInTheDocument();
  });
});
