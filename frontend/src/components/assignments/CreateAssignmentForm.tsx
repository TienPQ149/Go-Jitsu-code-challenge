interface CreateAssignmentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  isError: boolean;
}

export function CreateAssignmentForm({
  value,
  onChange,
  onSubmit,
  isPending,
  isError,
}: CreateAssignmentFormProps) {
  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New assignment label"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || isPending}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Creating…" : "Create"}
        </button>
      </div>
      {isError && <p className="text-xs text-red-600">Failed to create assignment.</p>}
    </div>
  );
}
