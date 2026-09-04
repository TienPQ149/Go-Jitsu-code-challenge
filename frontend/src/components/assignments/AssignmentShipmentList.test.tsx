import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Shipment } from "../../types/domain";
import { AssignmentShipmentList } from "./AssignmentShipmentList";

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

describe("AssignmentShipmentList", () => {
  it("shows a loading state", () => {
    render(<AssignmentShipmentList shipments={undefined} isLoading={true} />);

    expect(screen.getByText("Loading shipments…")).toBeInTheDocument();
  });

  it("shows an empty state when shipments is undefined", () => {
    render(<AssignmentShipmentList shipments={undefined} isLoading={false} />);

    expect(screen.getByText("No shipments in this assignment.")).toBeInTheDocument();
  });

  it("shows an empty state when shipments is an empty array", () => {
    render(<AssignmentShipmentList shipments={[]} isLoading={false} />);

    expect(screen.getByText("No shipments in this assignment.")).toBeInTheDocument();
  });

  it("renders shipment label, client name, and status", () => {
    const shipments = [makeShipment("shp_1"), makeShipment("shp_2")];
    render(<AssignmentShipmentList shipments={shipments} isLoading={false} />);

    expect(screen.getByText("Label-shp_1")).toBeInTheDocument();
    expect(screen.getByText("Client-shp_1 · OPEN")).toBeInTheDocument();
    expect(screen.getByText("Label-shp_2")).toBeInTheDocument();
    expect(screen.getByText("Client-shp_2 · OPEN")).toBeInTheDocument();
  });
});
