import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Status, TodoForm } from "../types/todo";

const TodoSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Max 120 chars"),
  status: z.enum(["todo", "done"]),
});

type Props = {
  onSubmit: (data: TodoForm) => void;
  initial?: Partial<TodoForm>;
  submitting?: boolean;
};

export default function TodoEditor({ onSubmit, initial, submitting }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TodoForm>({
    resolver: zodResolver(TodoSchema),
    defaultValues: { title: "", status: "todo", ...initial },
  });

  // Reset form whenever initial changes (for edit use cases)
  useEffect(() => {
    reset({
      title: initial?.title ?? "",
      status: (initial?.status as Status) ?? "todo",
    });
  }, [initial, reset]);

  return (
    <form
      onSubmit={handleSubmit((d) => onSubmit(d))}
      className="flex gap-2 w-full"
    >
      <input
        {...register("title")}
        placeholder="Add a task…"
        className="flex-1 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary-300"
      />
      <select
        {...register("status")}
        className="rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-300"
      >
        <option value="todo">Todo</option>
        <option value="done">Done</option>
      </select>
      <button
        disabled={submitting}
        className="rounded-xl bg-primary-600 text-white px-4 py-2 hover:bg-primary-700 disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Add"}
      </button>

      {errors.title && (
        <span className="text-xs text-red-600 self-center">
          {errors.title.message}
        </span>
      )}
    </form>
  );
}
