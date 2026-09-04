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

vi.mock("../components/assignments/AssignmentListPanel", () => ({
  AssignmentListPanel: ({
    search,
    status,
    selectedId,
    onSelect,
    onSearchChange,
    onStatusChange,
  }: {
    search: string;
    status: string;
    selectedId: string | undefined;
    onSelect: (id: string) => void;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
  }) => (
    <div>
      <span>list-params:{status}:{search}</span>
      <span>list-selected:{selectedId ?? "none"}</span>
      <button onClick={() => onSelect("as_1")}>select-as_1</button>
      <button onClick={() => onSearchChange("sony")}>search-sony</button>
      <button onClick={() => onStatusChange("OPEN")}>status-open</button>
    </div>
  ),
}));

vi.mock("../components/assignments/AssignmentDetailPanel", () => ({
  AssignmentDetailPanel: ({
    assignmentId,
    onDeleted,
  }: {
    assignmentId: string | undefined;
    onDeleted: () => void;
  }) => (
    <div>
      <span>detail-{assignmentId ?? "none"}</span>
      <button onClick={onDeleted}>delete</button>
    </div>
  ),
}));

import { AssignmentsPage } from "./AssignmentsPage";

beforeEach(() => {
  vi.clearAllMocks();
  mockUseSearch.mockReturnValue({ status: undefined, search: undefined, selected: undefined });
  mockUseNavigate.mockReturnValue(mockNavigate);
});

describe("AssignmentsPage", () => {
  it("passes status/search params from URL to the list panel", () => {
    mockUseSearch.mockReturnValue({ status: "OPEN", search: "tx", selected: undefined });

    render(<AssignmentsPage />);

    expect(screen.getByText("list-params:OPEN:tx")).toBeInTheDocument();
  });

  it("renders the detail panel with the currently selected assignment", () => {
    mockUseSearch.mockReturnValue({ status: undefined, search: undefined, selected: "as_1" });

    render(<AssignmentsPage />);

    expect(screen.getByText("detail-as_1")).toBeInTheDocument();
  });

  it("shows no selection in the detail panel by default", () => {
    render(<AssignmentsPage />);

    expect(screen.getByText("detail-none")).toBeInTheDocument();
  });

  it("navigates with the selected assignment id when a row is selected", async () => {
    const user = userEvent.setup();
    render(<AssignmentsPage />);

    await user.click(screen.getByText("select-as_1"));

    const searchFn = mockNavigate.mock.calls[0][0].search;
    expect(searchFn({})).toEqual({ selected: "as_1" });
  });

  it("navigates with the search value when search changes", async () => {
    const user = userEvent.setup();
    render(<AssignmentsPage />);

    await user.click(screen.getByText("search-sony"));

    const searchFn = mockNavigate.mock.calls[0][0].search;
    expect(searchFn({})).toEqual({ search: "sony" });
  });

  it("navigates with the status value and clears selected when status changes", async () => {
    const user = userEvent.setup();
    render(<AssignmentsPage />);

    await user.click(screen.getByText("status-open"));

    const searchFn = mockNavigate.mock.calls[0][0].search;
    expect(searchFn({ selected: "as_1" })).toEqual({
      selected: undefined,
      status: "OPEN",
    });
  });

  it("clears the selected assignment when the detail panel reports a deletion", async () => {
    const user = userEvent.setup();
    mockUseSearch.mockReturnValue({ status: undefined, search: undefined, selected: "as_1" });
    render(<AssignmentsPage />);

    await user.click(screen.getByText("delete"));

    const searchFn = mockNavigate.mock.calls[0][0].search;
    expect(searchFn({ selected: "as_1" })).toEqual({ selected: undefined });
  });
});
