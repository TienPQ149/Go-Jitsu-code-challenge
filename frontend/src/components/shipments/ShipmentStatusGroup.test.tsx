import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Shipment } from "../../types/domain";

const mockUseInfiniteShipments = vi.fn();
vi.mock("../../hooks/useInfiniteShipments", () => ({
  useInfiniteShipments: (...args: unknown[]) => mockUseInfiniteShipments(...args),
}));

import { ShipmentStatusGroup } from "./ShipmentStatusGroup";

function makeShipment(id: string): Shipment {
  return {
    id,
    label: `Label-${id}`,
    client_name: `Client-${id}`,
    status: "OPEN",
    arrival_date: "2026-01-01T00:00:00.000Z",
    eta: "2026-01-02T00:00:00.000Z",
    warehouse_id: "581",
    delivery_by_date: "2026-01-03T00:00:00.000Z",
    lat: 1,
    lng: 2,
    assignment_id: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ShipmentStatusGroup", () => {
  it("shows the loading state", () => {
    mockUseInfiniteShipments.mockReturnValue({
      data: undefined,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: true,
      isError: false,
    });

    render(
      <ShipmentStatusGroup status="OPEN" search="" selectedId={undefined} onSelect={vi.fn()} />
    );

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows the error state", () => {
    mockUseInfiniteShipments.mockReturnValue({
      data: undefined,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: true,
    });

    render(
      <ShipmentStatusGroup status="OPEN" search="" selectedId={undefined} onSelect={vi.fn()} />
    );

    expect(screen.getByText("Failed to load open shipments.")).toBeInTheDocument();
  });

  it("shows an empty state when there are no shipments", () => {
    mockUseInfiniteShipments.mockReturnValue({
      data: { pages: [{ data: [], total: 0 }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
    });

    render(
      <ShipmentStatusGroup
        status="DELIVERED"
        search=""
        selectedId={undefined}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText("No shipments.")).toBeInTheDocument();
  });

  it("renders shipment rows and the total count", () => {
    const shipments = [makeShipment("shp_1"), makeShipment("shp_2")];
    mockUseInfiniteShipments.mockReturnValue({
      data: { pages: [{ data: shipments, total: 2 }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
    });

    render(
      <ShipmentStatusGroup status="OPEN" search="" selectedId={undefined} onSelect={vi.fn()} />
    );

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Client-shp_1")).toBeInTheDocument();
    expect(screen.getByText("Client-shp_2")).toBeInTheDocument();
  });

  it("toggles collapse/expand when the header is clicked", async () => {
    const user = userEvent.setup();
    mockUseInfiniteShipments.mockReturnValue({
      data: { pages: [{ data: [makeShipment("shp_1")], total: 1 }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
    });

    render(
      <ShipmentStatusGroup status="OPEN" search="" selectedId={undefined} onSelect={vi.fn()} />
    );

    expect(screen.getByText("Client-shp_1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Open/i }));

    expect(screen.queryByText("Client-shp_1")).not.toBeInTheDocument();
  });

  it("calls onSelect when a row is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    mockUseInfiniteShipments.mockReturnValue({
      data: { pages: [{ data: [makeShipment("shp_1")], total: 1 }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
    });

    render(
      <ShipmentStatusGroup status="OPEN" search="" selectedId={undefined} onSelect={onSelect} />
    );

    await user.click(screen.getByText("Client-shp_1"));
    expect(onSelect).toHaveBeenCalledWith("shp_1");
  });
});
