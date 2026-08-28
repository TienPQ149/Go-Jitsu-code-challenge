import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Shipment } from "../../types/domain";
import { ShipmentRow } from "./ShipmentRow";

const baseShipment: Shipment = {
  id: "shp_001",
  label: "LAX-581-250521-6",
  client_name: "Oceanic",
  status: "OPEN",
  arrival_date: "2026-08-23T10:25:09.000Z",
  eta: "2026-08-24T00:25:09.000Z",
  warehouse_id: "581",
  delivery_by_date: "2026-08-25T00:00:00.000Z",
  lat: 32.9,
  lng: -96.7,
  assignment_id: null,
};

describe("ShipmentRow", () => {
  it("renders client name and label", () => {
    render(
      <ShipmentRow shipment={baseShipment} isSelected={false} onSelect={vi.fn()} />
    );

    expect(screen.getByText("Oceanic")).toBeInTheDocument();
    expect(screen.getByText("LAX-581-250521-6")).toBeInTheDocument();
  });

  it("calls onSelect with the shipment id when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ShipmentRow shipment={baseShipment} isSelected={false} onSelect={onSelect} />
    );

    await user.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledWith("shp_001");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("applies selected styling when isSelected is true", () => {
    render(
      <ShipmentRow shipment={baseShipment} isSelected={true} onSelect={vi.fn()} />
    );

    expect(screen.getByRole("button").className).toContain("bg-blue-50");
  });

  it("does not apply selected styling when isSelected is false", () => {
    render(
      <ShipmentRow shipment={baseShipment} isSelected={false} onSelect={vi.fn()} />
    );

    expect(screen.getByRole("button").className).not.toContain("bg-blue-50");
  });
});
