import type { Status } from "../types/todo";

type Props = {
  search: string;
  filter: "all" | Status;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: "all" | Status) => void;
};

export default function FiltersBar({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: Props) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search…"
        className="flex-1 rounded-xl border px-3 py-2"
      />
      <select
        value={filter}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e) => onFilterChange(e.target.value as any)}
        className="rounded-xl border px-3 py-2"
      >
        <option value="all">All</option>
        <option value="todo">Todo</option>
        <option value="done">Done</option>
      </select>
    </div>
  );
}
