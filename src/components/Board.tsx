import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { API } from "../api/todos";
import { actions, selectBoard } from "../store/boardSlice";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { RemoteTodo, Status, Todo } from "../types/todo";
import Column from "./Column";
import Confirm from "./Confirm";
import TodoEditor from "./TodoEditor";

export default function Board() {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const { order, filter, search, confirmDeleteId } = useSelector(selectBoard);

  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }, // start drag after 4px move
    })
  );

  const getTodoById = (id: number | null) =>
    id == null ? undefined : todosById.get(id);

  const handleDragStart = (evt: DragStartEvent) => {
    setActiveId(evt.active.id as number);
  };

  const todosQ = useQuery({
    queryKey: ["todos"],
    queryFn: API.list,
    staleTime: 60_000,
  });

  const todos: Todo[] = useMemo(
    () => (todosQ.data || []).map(API.mapRemoteToLocal),
    [todosQ.data]
  );

  useEffect(() => {
    if (todosQ.isSuccess) {
      dispatch(actions.seed({ todos }));
    }
  }, [todosQ.isSuccess]);

  // at top: make sure you have actions from the slice
  // import { actions } from "../store/boardSlice";

  const createMut = useMutation({
    mutationFn: (input: { title: string; status: Status }) =>
      // send completed based on status so server returns it correctly
      API.create(input.title),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["todos"] });
      const prev = qc.getQueryData<RemoteTodo[]>(["todos"]);

      // temp negative id
      const tempId = Math.floor(Math.random() * 1_000_000) * -1;

      const optimistic: RemoteTodo = {
        id: tempId,
        todo: vars.title,
        completed: vars.status === "done",
        userId: 1,
      };

      // put optimistic item at top of list
      qc.setQueryData<RemoteTodo[]>(["todos"], (old) => [
        optimistic,
        ...(old || []),
      ]);

      // put it into the correct column based on chosen status
      dispatch(actions.pushNewTo({ id: tempId, status: vars.status }));

      // return context for success/error
      return { prev, tempId, status: vars.status };
    },

    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["todos"], ctx.prev);
    },

    onSuccess: (data, _vars, ctx) => {
      // swap the optimistic item in cache with real item
      qc.setQueryData<RemoteTodo[]>(["todos"], (old) => {
        if (!old) return [data];
        const idx = old.findIndex((t) => t.id === ctx?.tempId);
        if (idx === -1) return [data, ...old];
        const copy = [...old];
        copy[idx] = data;
        return copy;
      });

      // replace temp id with real id in the column order so it stays visible
      if (ctx?.tempId != null) {
        dispatch(actions.replaceId({ tempId: ctx.tempId, realId: data.id }));
      }
    },
  });

  const updateMut = useMutation({
    // accept optional title and/or status
    mutationFn: (input: { id: number; title?: string; status?: Status }) =>
      API.update(input.id, {
        title: input.title,
        status: input.status,
      }),

    // optimistic update for both fields against the RemoteTodo[] cache
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["todos"] });
      const prev = qc.getQueryData<RemoteTodo[]>(["todos"]);

      qc.setQueryData<RemoteTodo[]>(["todos"], (old) =>
        (old || []).map((t) =>
          t.id === vars.id
            ? {
                ...t,
                todo: vars.title ?? t.todo,
                completed:
                  vars.status !== undefined
                    ? vars.status === "done"
                    : t.completed,
              }
            : t
        )
      );

      return { prev };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["todos"], ctx.prev);
    },

    // optional: keep server truth synced if anything differs
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => API.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["todos"] });
      const prev = qc.getQueryData<Todo[]>(["todos"]);
      dispatch(actions.yank({ id })); // remove from board order
      qc.setQueryData<Todo[]>(
        ["todos"],
        (old) => old?.filter((t) => t.id !== id) || []
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["todos"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const todosById = useMemo(
    () => new Map(todos.map((t) => [t.id, t])),
    [todos]
  );

  const searchLower = search.trim().toLowerCase();
  const filterPredicate = (t: Todo) => {
    const okFilter = filter === "all" || t.status === filter;
    const okSearch =
      !searchLower || t.title.toLowerCase().includes(searchLower);
    return okFilter && okSearch;
  };

  const cols: Record<Status, Todo[]> = {
    todo: order.todo
      .map((id) => todosById.get(id)!)
      .filter(Boolean)
      .filter(filterPredicate),
    done: order.done
      .map((id) => todosById.get(id)!)
      .filter(Boolean)
      .filter(filterPredicate),
  };

  const onMenu = (t: Todo, origin: Status) => {
    const newStatus: Status = t.status === "todo" ? "done" : "todo";
    dispatch(actions.moveTo({ id: t.id, from: origin, to: newStatus }));
    updateMut.mutate({ id: t.id, status: newStatus });
  };

  const handleAdd = (data: { title: string; status: Status }) => {
    createMut.mutate({ title: data.title, status: data.status });
  };

  const findColumnOf = (id: number): Status | null => {
    if (order.todo.includes(id)) return "todo";
    if (order.done.includes(id)) return "done";
    return null;
  };
  const handleDragEnd = (evt: DragEndEvent) => {
    setActiveId(null);

    const activeId = evt.active?.id as number | undefined;
    const overId = evt.over?.id as number | Status | undefined;

    if (!activeId || !overId) return;

    const from = findColumnOf(activeId);
    if (!from) return;

    // Dropped on a column container (empty space)
    if (overId === "todo" || overId === "done") {
      const to = overId as Status;
      const fromIndex = order[from].indexOf(activeId);
      const toIndex = 0; // insert at top (or order[to].length for bottom)
      dispatch(actions.reorder({ from, to, fromIndex, toIndex, id: activeId }));
      // sync completed boolean
      updateMut.mutate({ id: activeId, status: to });
      return;
    }

    // Dropped on another card
    const overCardId = overId as number;
    const to = findColumnOf(overCardId);
    if (!to) return;

    const fromIndex = order[from].indexOf(activeId);
    const toIndex = order[to].indexOf(overCardId);

    dispatch(actions.reorder({ from, to, fromIndex, toIndex, id: activeId }));
    if (from !== to) {
      updateMut.mutate({ id: activeId, status: to });
    }
  };

  const handleDelete = (id: number) => {
    deleteMut.mutate(id);
  };

  const handleEdit = (id: number, title: string) => {
    updateMut.mutate({ id, title });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-primary-700">Todo Board</h1>
        <p className="text-sm text-gray-600">
          Redux Toolkit + React Query + Zod + dnd-kit
        </p>
      </header>

      <div className="flex items-center gap-2 mb-4">
        <TodoEditor onSubmit={handleAdd} submitting={createMut.isPending} />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <input
          value={search}
          onChange={(e) => dispatch(actions.setSearch(e.target.value))}
          placeholder="Search…"
          className="flex-1 rounded-xl border px-3 py-2"
        />
        <select
          value={filter}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e) => dispatch(actions.setFilter(e.target.value as any))}
          className="rounded-xl border px-3 py-2"
        >
          <option value="all">All</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {todosQ.isLoading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : todosQ.isError ? (
        <div className="text-sm text-red-600">Failed to load todos</div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SortableContext
              items={cols.todo.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <Column
                title="Todo"
                status="todo"
                todos={cols.todo.map((t) => ({ ...t, status: "todo" }))}
                onMenu={onMenu}
                onDelete={handleDelete} // new
                onEdit={handleEdit}
              />
            </SortableContext>
            <SortableContext
              items={cols.done.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <Column
                title="Done"
                status="done"
                todos={cols.done}
                onMenu={onMenu}
                onDelete={handleDelete} // new
                onEdit={handleEdit}
              />
            </SortableContext>
          </div>
          {/* Floating clone that follows the cursor */}
          <DragOverlay>
            {(() => {
              const t = getTodoById(activeId);
              return t ? (
                <div className="bg-white border rounded-2xl p-3 shadow-lg pointer-events-none">
                  <p className="font-medium leading-tight">{t.title}</p>
                  <p className="text-xs text-gray-500 capitalize mt-1">
                    {t.status}
                  </p>
                </div>
              ) : null;
            })()}
          </DragOverlay>
        </DndContext>
      )}

      <Confirm
        open={confirmDeleteId != null}
        onClose={() => dispatch(actions.closeDeleteConfirm())}
        onConfirm={() => {
          if (confirmDeleteId != null) {
            deleteMut.mutate(confirmDeleteId);
            dispatch(actions.closeDeleteConfirm());
          }
        }}
      />
    </div>
  );
}
