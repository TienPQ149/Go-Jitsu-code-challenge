import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockMutate = vi.fn();
const mockUseCreateShipment = vi.fn();

vi.mock("../../hooks/useShipmentMutations", () => ({
  useCreateShipment: (...args: unknown[]) => mockUseCreateShipment(...args),
}));

import { CreateShipmentModal } from "./CreateShipmentModal";

beforeEach(() => {
  vi.clearAllMocks();
  mockUseCreateShipment.mockReturnValue({
    mutate: mockMutate,
    isPending: false,
    isError: false,
  });
});

describe("CreateShipmentModal", () => {
  it("shows validation errors when submitting empty required fields", async () => {
    const user = userEvent.setup();
    render(<CreateShipmentModal onClose={vi.fn()} onCreated={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findAllByText("Required")).toHaveLength(2);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("submits client_name and label, then calls onCreated + onClose on success", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onCreated = vi.fn();
    mockMutate.mockImplementation((_values, { onSuccess }) => {
      onSuccess({ id: "shp_new" });
    });

    render(<CreateShipmentModal onClose={onClose} onCreated={onCreated} />);

    const [clientNameInput, labelInput] = screen.getAllByRole("textbox");
    await user.type(clientNameInput, "Acme");
    await user.type(labelInput, "LAX-1");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(mockMutate).toHaveBeenCalledWith(
      { client_name: "Acme", label: "LAX-1" },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(onCreated).toHaveBeenCalledWith("shp_new");
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<CreateShipmentModal onClose={onClose} onCreated={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows an error message when creation fails", () => {
    mockUseCreateShipment.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: true,
    });

    render(<CreateShipmentModal onClose={vi.fn()} onCreated={vi.fn()} />);

    expect(screen.getByText("Failed to create shipment.")).toBeInTheDocument();
  });
});
