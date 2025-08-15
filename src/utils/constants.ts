import type { Status } from "../types/todo";

// src/utils/constants.ts

export const QUERY_KEYS = {
  todos: ["todos"] as const,
};

export const STATUS_LABELS: Record<Status, string> = {
  todo: "Todo",
  done: "Done",
};

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "todo", label: "Todo" },
  { value: "done", label: "Done" },
];
