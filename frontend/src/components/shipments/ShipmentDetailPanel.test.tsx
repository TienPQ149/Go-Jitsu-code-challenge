import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Shipment } from "../../types/domain";

const mockUseShipment = vi.fn();
const mockUseUpdateShipment = vi.fn();
const mockUseDeleteShipment = vi.fn();
const mockUpdateMutate = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock("../../hooks/useShipment", () => ({
  useShipment: (...args: unknown[]) => mockUseShipment(...args),
}));
vi.mock("../../hooks/useShipmentMutations", () => ({
  useUpdateShipment: (...args: unknown[]) => mockUseUpdateShipment(...args),
  useDeleteShipment: (...args: unknown[]) => mockUseDeleteShipment(...args),
}));
vi.mock("../map/ShipmentMap", () => ({
  ShipmentMap: () => <div data-testid="map" />,
}));
vi.mock("./ShipmentStatusControl", () => ({
  ShipmentStatusControl: () => <div data-testid="status-control" />,
}));

import { ShipmentDetailPanel } from "./ShipmentDetailPanel";

const shipment: Shipment = {
  id: "shp_001",
  label: "LAX-1",
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
  mockUseUpdateShipment.mockReturnValue({
    mutate: mockUpdateMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
  });
  mockUseDeleteShipment.mockReturnValue({
    mutate: mockDeleteMutate,
    isPending: false,
  });
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

describe("ShipmentDetailPanel", () => {
  it("shows a placeholder when no shipment is selected", () => {
    mockUseShipment.mockReturnValue({ data: undefined, isLoading: false, isError: false });

    render(<ShipmentDetailPanel shipmentId={undefined} onDeleted={vi.fn()} />);

    expect(
      screen.getByText("Select a shipment to see its details.")
    ).toBeInTheDocument();
  });

  it("shows a loading state", () => {
    mockUseShipment.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    render(<ShipmentDetailPanel shipmentId="shp_001" onDeleted={vi.fn()} />);

    expect(screen.getByText("Loading shipment…")).toBeInTheDocument();
  });

  it("shows an error state", () => {
    mockUseShipment.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    render(<ShipmentDetailPanel shipmentId="shp_001" onDeleted={vi.fn()} />);

    expect(screen.getByText("Failed to load shipment.")).toBeInTheDocument();
  });

  it("renders shipment details, status control, and map", () => {
    mockUseShipment.mockReturnValue({ data: shipment, isLoading: false, isError: false });

    render(<ShipmentDetailPanel shipmentId="shp_001" onDeleted={vi.fn()} />);

    expect(screen.getByText("LAX-1")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByTestId("status-control")).toBeInTheDocument();
    expect(screen.getByTestId("map")).toBeInTheDocument();
  });

  it("submits the edit form with updated latitude", async () => {
    const user = userEvent.setup();
    mockUseShipment.mockReturnValue({ data: shipment, isLoading: false, isError: false });

    render(<ShipmentDetailPanel shipmentId="shp_001" onDeleted={vi.fn()} />);

    const [latInput] = screen.getAllByRole("spinbutton");
    await user.clear(latInput);
    await user.type(latInput, "10");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(mockUpdateMutate).toHaveBeenCalled();
    const payload = mockUpdateMutate.mock.calls[0][0];
    expect(payload.lat).toBe(10);
  });

  it("asks for confirmation and calls delete + onDeleted on confirm", async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    mockDeleteMutate.mockImplementation((_id, { onSuccess }) => onSuccess());
    mockUseShipment.mockReturnValue({ data: shipment, isLoading: false, isError: false });

    render(<ShipmentDetailPanel shipmentId="shp_001" onDeleted={onDeleted} />);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteMutate).toHaveBeenCalledWith(
      "shp_001",
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(onDeleted).toHaveBeenCalled();
  });

  it("does not delete when confirmation is declined", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    mockUseShipment.mockReturnValue({ data: shipment, isLoading: false, isError: false });

    render(<ShipmentDetailPanel shipmentId="shp_001" onDeleted={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(mockDeleteMutate).not.toHaveBeenCalled();
  });
});
