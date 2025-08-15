// src/components/SortableItem.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useEffect, useRef, useState } from "react";
import type { Status, Todo } from "../types/todo";

type Props = {
  todo: Todo;
  onMenu: (t: Todo, origin: Status) => void; // keep your status-cycle action if you still want it elsewhere
  onDelete: (id: number) => void; // hook to your delete flow (optimistic or confirm)
  onEdit: (id: number, title: string) => void; // hook to your update mutation
};

export default function SortableItem({ todo, onDelete, onEdit }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1, // fade original beneath overlay (drag overlay follows cursor)
  };

  // popover state
  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState(todo.title);

  // close popover on outside click / ESC
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(t) &&
        btnRef.current &&
        !btnRef.current.contains(t)
      ) {
        setMenuOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setEditOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group bg-white border border-gray-200 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-grab active:cursor-grabbing select-none relative"
      aria-roledescription="draggable"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium leading-tight break-words text-gray-800">
            {todo.title}
          </p>
          <p
            className={`text-xs capitalize mt-1 ${
              todo.status === "done" ? "text-success-500" : "text-gray-500"
            }`}
          >
            {todo.status.replace("_", " ")}
          </p>
        </div>
        <button
          ref={btnRef}
          type="button"
          className="opacity-70 group-hover:opacity-100 rounded-md px-2 py-1 text-sm hover:bg-gray-100 hover:text-primary-600"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          aria-label="Open menu"
          title="More"
        >
          ⋯
        </button>
      </div>

      {/* Tiny popover menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-2 top-10 z-20 w-36 rounded-xl border bg-white shadow-lg p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-gray-100"
            onClick={() => {
              setMenuOpen(false);
              setEditOpen(true);
              setTitle(todo.title);
            }}
          >
            Edit
          </button>
          <button
            className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-red-50 text-red-600"
            onClick={() => {
              setMenuOpen(false);
              onDelete(todo.id); // you can open your Confirm modal or do optimistic delete here
            }}
          >
            Delete
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/30"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-[420px] max-w-[90vw] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-3">Edit task</h4>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = title.trim();
                if (!trimmed) return;
                onEdit(todo.id, trimmed); // call your update mutation (optimistic is fine)
                setEditOpen(false);
              }}
            >
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ring-gray-300"
                placeholder="Task title"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl border"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-black text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
