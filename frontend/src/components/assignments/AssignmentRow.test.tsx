import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Assignment } from "../../types/domain";
import { AssignmentRow } from "./AssignmentRow";

const baseAssignment: Assignment = {
  id: "as_001",
  label: "TX-127",
  status: "OPEN",
  shipment_count: 2,
  clients: ["Acme", "Sony"],
};

describe("AssignmentRow", () => {
  it("renders label, status, and shipment/client counts", () => {
    render(
      <AssignmentRow assignment={baseAssignment} isSelected={false} onSelect={vi.fn()} />
    );

    expect(screen.getByText("TX-127")).toBeInTheDocument();
    expect(screen.getByText("OPEN")).toBeInTheDocument();
    expect(screen.getByText("2 shipments · 2 clients")).toBeInTheDocument();
  });

  it("calls onSelect with the assignment id when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <AssignmentRow assignment={baseAssignment} isSelected={false} onSelect={onSelect} />
    );

    await user.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledWith("as_001");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("applies selected styling when isSelected is true", () => {
    render(
      <AssignmentRow assignment={baseAssignment} isSelected={true} onSelect={vi.fn()} />
    );

    expect(screen.getByRole("button").className).toContain("bg-blue-50");
  });

  it("does not apply selected styling when isSelected is false", () => {
    render(
      <AssignmentRow assignment={baseAssignment} isSelected={false} onSelect={vi.fn()} />
    );

    expect(screen.getByRole("button").className).not.toContain("bg-blue-50");
  });
});
