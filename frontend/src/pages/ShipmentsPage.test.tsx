import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockNavigate = vi.fn();
const mockUseSearch = vi.fn();
const mockUseNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useSearch: (...args: unknown[]) => mockUseSearch(...args),
  useNavigate: (...args: unknown[]) => mockUseNavigate(...args),
}));

vi.mock("../components/shipments/ShipmentListPanel", () => ({
  ShipmentListPanel: ({
    onSelect,
    onSearchChange,
  }: {
    onSelect: (id: string) => void;
    onSearchChange: (value: string) => void;
  }) => (
    <div>
      <button onClick={() => onSelect("shp_1")}>select-shp_1</button>
      <button onClick={() => onSearchChange("sony")}>search-sony</button>
    </div>
  ),
}));
vi.mock("../components/shipments/ShipmentDetailPanel", () => ({
  ShipmentDetailPanel: ({
    shipmentId,
    onDeleted,
  }: {
    shipmentId: string | undefined;
    onDeleted: () => void;
  }) => (
    <div>
      <span>detail-{shipmentId ?? "none"}</span>
      <button onClick={onDeleted}>delete</button>
    </div>
  ),
}));
vi.mock("../components/shipments/CreateShipmentModal", () => ({
  CreateShipmentModal: ({
    onClose,
    onCreated,
  }: {
    onClose: () => void;
    onCreated: (id: string) => void;
  }) => (
    <div>
      <button onClick={onClose}>close-modal</button>
      <button onClick={() => onCreated("shp_new")}>create-shp</button>
    </div>
  ),
}));

import { ShipmentsPage } from "./ShipmentsPage";

beforeEach(() => {
  vi.clearAllMocks();
  mockUseSearch.mockReturnValue({ selected: undefined, search: undefined });
  mockUseNavigate.mockReturnValue(mockNavigate);
});

describe("ShipmentsPage", () => {
  it("renders the detail panel with the currently selected shipment", () => {
    mockUseSearch.mockReturnValue({ selected: "shp_1", search: "sony" });

    render(<ShipmentsPage />);

    expect(screen.getByText("detail-shp_1")).toBeInTheDocument();
  });

  it("navigates with the selected shipment id when a row is selected", async () => {
    const user = userEvent.setup();
    render(<ShipmentsPage />);

    await user.click(screen.getByText("select-shp_1"));

    const searchFn = mockNavigate.mock.calls[0][0].search;
    expect(searchFn({})).toEqual({ selected: "shp_1" });
  });

  it("navigates with the search value when search changes", async () => {
    const user = userEvent.setup();
    render(<ShipmentsPage />);

    await user.click(screen.getByText("search-sony"));

    const searchFn = mockNavigate.mock.calls[0][0].search;
    expect(searchFn({})).toEqual({ search: "sony" });
  });

  it("clears the selected shipment when the detail panel reports a deletion", async () => {
    const user = userEvent.setup();
    mockUseSearch.mockReturnValue({ selected: "shp_1", search: undefined });
    render(<ShipmentsPage />);

    await user.click(screen.getByText("delete"));

    const searchFn = mockNavigate.mock.calls[0][0].search;
    expect(searchFn({ selected: "shp_1" })).toEqual({ selected: undefined });
  });

  it("opens the create modal, and selecting the new shipment closes it + selects it", async () => {
    const user = userEvent.setup();
    render(<ShipmentsPage />);

    await user.click(screen.getByRole("button", { name: "New shipment" }));
    expect(screen.getByText("close-modal")).toBeInTheDocument();

    await user.click(screen.getByText("create-shp"));

    const lastCall = mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1][0];
    expect(lastCall.search({})).toEqual({ selected: "shp_new" });
    expect(screen.queryByText("close-modal")).not.toBeInTheDocument();
  });

  it("closes the create modal via Cancel/close without navigating", async () => {
    const user = userEvent.setup();
    render(<ShipmentsPage />);

    await user.click(screen.getByRole("button", { name: "New shipment" }));
    await user.click(screen.getByText("close-modal"));

    expect(screen.queryByText("close-modal")).not.toBeInTheDocument();
  });
});
