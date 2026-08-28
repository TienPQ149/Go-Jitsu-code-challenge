import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-leaflet", () => ({
  MapContainer: ({
    children,
    center,
  }: {
    children: React.ReactNode;
    center: [number, number];
  }) => (
    <div data-testid="map-container" data-center={JSON.stringify(center)}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({
    children,
    position,
  }: {
    children: React.ReactNode;
    position: [number, number];
  }) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
}));

vi.mock("leaflet", () => ({
  default: { icon: vi.fn(() => ({})) },
}));
vi.mock("leaflet/dist/leaflet.css", () => ({}));
vi.mock("leaflet/dist/images/marker-icon-2x.png", () => ({ default: "icon2x.png" }));
vi.mock("leaflet/dist/images/marker-icon.png", () => ({ default: "icon.png" }));
vi.mock("leaflet/dist/images/marker-shadow.png", () => ({ default: "shadow.png" }));

import { ShipmentMap } from "./ShipmentMap";

describe("ShipmentMap", () => {
  it("renders the map centered on the given coordinates with a popup label", () => {
    render(<ShipmentMap lat={32.9} lng={-96.7} label="Oceanic" />);

    expect(screen.getByTestId("map-container")).toHaveAttribute(
      "data-center",
      JSON.stringify([32.9, -96.7])
    );
    expect(screen.getByTestId("marker")).toHaveAttribute(
      "data-position",
      JSON.stringify([32.9, -96.7])
    );
    expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
    expect(screen.getByText("Oceanic")).toBeInTheDocument();
  });
});
