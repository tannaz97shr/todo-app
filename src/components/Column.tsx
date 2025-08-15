// src/components/Column.tsx
import { useDroppable } from "@dnd-kit/core";
import type { Status, Todo } from "../types/todo";
import SortableItem from "./SortableItem";

type ColumnProps = {
  title: string;
  status: Status;
  todos: Todo[];
  onMenu: (t: Todo, origin: Status) => void;
  onDelete: (id: number) => void; // NEW
  onEdit: (id: number, title: string) => void; // NEW
};

export default function Column({
  title,
  status,
  todos,
  onMenu,
  onDelete,
  onEdit,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column" },
  });

  return (
    <div
      ref={setNodeRef}
      className={[
        "flex-1 min-w-[280px] rounded-3xl p-3 border transition-colors",
        isOver ? "bg-accent-50 border-accent-200" : "bg-white border-gray-200",
      ].join(" ")}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 flex items-center justify-between text-gray-700">
        <span>{title}</span>
        <span className="text-xs text-gray-500">{todos.length}</span>
      </h3>

      <div className="flex flex-col gap-2">
        {todos.map((t) => (
          <SortableItem
            key={t.id}
            todo={t}
            onMenu={onMenu}
            onDelete={onDelete} // pass down
            onEdit={onEdit} // pass down
          />
        ))}
      </div>
    </div>
  );
}
