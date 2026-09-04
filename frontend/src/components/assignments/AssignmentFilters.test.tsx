import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AssignmentFilters } from "./AssignmentFilters";

describe("AssignmentFilters", () => {
  it("renders the current search value and status", () => {
    render(
      <AssignmentFilters
        search="sony"
        status="OPEN"
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText("Search assignments...")).toHaveValue("sony");
    expect(screen.getByRole("combobox")).toHaveValue("OPEN");
  });

  it("calls onSearchChange when the search input changes", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(
      <AssignmentFilters
        search=""
        status=""
        onSearchChange={onSearchChange}
        onStatusChange={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("Search assignments..."), "a");

    expect(onSearchChange).toHaveBeenCalledWith("a");
  });

  it("calls onStatusChange when the status select changes", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    render(
      <AssignmentFilters
        search=""
        status=""
        onSearchChange={vi.fn()}
        onStatusChange={onStatusChange}
      />
    );

    await user.selectOptions(screen.getByRole("combobox"), "COMPLETED");

    expect(onStatusChange).toHaveBeenCalledWith("COMPLETED");
  });

  it("lists all status options", () => {
    render(
      <AssignmentFilters search="" status="" onSearchChange={vi.fn()} onStatusChange={vi.fn()} />
    );

    expect(screen.getByRole("option", { name: "All statuses" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "OPEN" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "COMPLETED" })).toBeInTheDocument();
  });
});
