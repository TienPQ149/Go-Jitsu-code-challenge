type AssignmentStatusFilter = "OPEN" | "COMPLETED" | "";

interface AssignmentFiltersProps {
  search: string;
  status: AssignmentStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AssignmentStatusFilter) => void;
}

export function AssignmentFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: AssignmentFiltersProps) {
  return (
    <>
      <input
        type="text"
        placeholder="Search assignments..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as AssignmentStatusFilter)}
        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All statuses</option>
        <option value="OPEN">OPEN</option>
        <option value="COMPLETED">COMPLETED</option>
      </select>
    </>
  );
}
