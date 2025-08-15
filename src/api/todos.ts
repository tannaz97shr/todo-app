import type { RemoteTodo, Status, Todo } from "../types/todo";

const BASE_URL = "https://dummyjson.com/todos";

export const API = {
  async list(): Promise<RemoteTodo[]> {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch todos");
    const data = await res.json();
    return data.todos as RemoteTodo[];
  },

  async create(title: string, completed = false): Promise<RemoteTodo> {
    const res = await fetch(`${BASE_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todo: title, completed, userId: 1 }),
    });
    if (!res.ok) throw new Error("Failed to create todo");
    return res.json();
  },

  /**
   * Update a todo by ID.
   * Accepts partial fields so we can use it for both title edits and status changes.
   * Status is mapped to completed boolean before sending.
   */
  async update(
    id: number,
    changes: { title?: string; status?: Status }
  ): Promise<RemoteTodo> {
    const patch: Partial<RemoteTodo> = {};

    if (changes.title !== undefined) {
      patch.todo = changes.title;
    }
    if (changes.status !== undefined) {
      patch.completed = changes.status === "done";
    }

    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT", // PUT works fine for full or partial update in DummyJSON
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`Failed to update todo ${id}`);
    return res.json();
  },

  async remove(id: number): Promise<{ isDeleted: boolean; id: number }> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete todo");
    return res.json();
  },

  // Local mapping helper: RemoteTodo → Todo
  mapRemoteToLocal(r: RemoteTodo): Todo {
    return {
      id: r.id,
      title: r.todo,
      status: r.completed ? "done" : "todo",
      userId: r.userId,
    };
  },
};
