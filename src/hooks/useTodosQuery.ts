// src/hooks/useTodosQuery.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "../api/todos";
import type { Status } from "../types/todo";

const TODOS_KEY = ["todos"];

export function useTodosQuery() {
  return useQuery({
    queryKey: TODOS_KEY,
    queryFn: API.list,
    staleTime: 60_000,
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; status: Status }) =>
      API.create(input.title),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; title?: string; status?: Status }) =>
      API.update(input.id, {
        todo: input.title,
        completed: input.status ? input.status === "done" : undefined,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => API.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}
