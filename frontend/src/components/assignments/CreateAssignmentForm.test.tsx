import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateAssignmentForm } from "./CreateAssignmentForm";

describe("CreateAssignmentForm", () => {
  it("renders the current value", () => {
    render(
      <CreateAssignmentForm
        value="TX-999"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isPending={false}
        isError={false}
      />
    );

    expect(screen.getByPlaceholderText("New assignment label")).toHaveValue("TX-999");
  });

  it("calls onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CreateAssignmentForm
        value=""
        onChange={onChange}
        onSubmit={vi.fn()}
        isPending={false}
        isError={false}
      />
    );

    await user.type(screen.getByPlaceholderText("New assignment label"), "a");

    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("disables the Create button when value is empty", () => {
    render(
      <CreateAssignmentForm
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isPending={false}
        isError={false}
      />
    );

    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
  });

  it("disables the Create button when value is only whitespace", () => {
    render(
      <CreateAssignmentForm
        value="   "
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isPending={false}
        isError={false}
      />
    );

    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
  });

  it("calls onSubmit when the Create button is clicked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CreateAssignmentForm
        value="TX-999"
        onChange={vi.fn()}
        onSubmit={onSubmit}
        isPending={false}
        isError={false}
      />
    );

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows pending label and disables the button while pending", () => {
    render(
      <CreateAssignmentForm
        value="TX-999"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isPending={true}
        isError={false}
      />
    );

    const button = screen.getByRole("button", { name: "Creating…" });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("shows an error message when isError is true", () => {
    render(
      <CreateAssignmentForm
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isPending={false}
        isError={true}
      />
    );

    expect(screen.getByText("Failed to create assignment.")).toBeInTheDocument();
  });

  it("does not show an error message when isError is false", () => {
    render(
      <CreateAssignmentForm
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isPending={false}
        isError={false}
      />
    );

    expect(screen.queryByText("Failed to create assignment.")).not.toBeInTheDocument();
  });
});
