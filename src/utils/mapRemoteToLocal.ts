import type { RemoteTodo, Todo } from "../types/todo";

export function mapRemoteToLocal(r: RemoteTodo): Todo {
  return {
    id: r.id,
    title: r.todo,
    status: r.completed ? "done" : "todo",
    userId: r.userId,
  };
}
