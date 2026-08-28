import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./ShipmentStatusGroup", () => ({
  ShipmentStatusGroup: ({ status, search }: { status: string; search: string }) => (
    <div data-testid={`group-${status}`}>{`${status}:${search}`}</div>
  ),
}));

import { ShipmentListPanel } from "./ShipmentListPanel";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ShipmentListPanel", () => {
  it("renders a status group for OPEN/IN_TRANSIT/DELIVERED", () => {
    render(
      <ShipmentListPanel
        searchInitial=""
        selectedId={undefined}
        onSelect={vi.fn()}
        onSearchChange={vi.fn()}
      />
    );

    expect(screen.getByTestId("group-OPEN")).toBeInTheDocument();
    expect(screen.getByTestId("group-IN_TRANSIT")).toBeInTheDocument();
    expect(screen.getByTestId("group-DELIVERED")).toBeInTheDocument();
  });

  it("initializes the search input from searchInitial", () => {
    render(
      <ShipmentListPanel
        searchInitial="sony"
        selectedId={undefined}
        onSelect={vi.fn()}
        onSearchChange={vi.fn()}
      />
    );

    expect(
      screen.getByPlaceholderText("Search by label or client name…")
    ).toHaveValue("sony");
  });

  it("debounces search input changes before calling onSearchChange", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(
      <ShipmentListPanel
        searchInitial=""
        selectedId={undefined}
        onSelect={vi.fn()}
        onSearchChange={onSearchChange}
      />
    );

    await waitFor(() => expect(onSearchChange).toHaveBeenCalledWith(""));

    await user.type(
      screen.getByPlaceholderText("Search by label or client name…"),
      "sony"
    );

    await waitFor(() => expect(onSearchChange).toHaveBeenLastCalledWith("sony"), {
      timeout: 1000,
    });
  });
});
