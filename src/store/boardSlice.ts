import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from ".";
import type { Status, Todo } from "../types/todo";

type BoardState = {
  order: {
    todo: number[];
    done: number[];
  };
  filter: "all" | Status;
  search: string;
  confirmDeleteId: number | null;
};

type SeedPayload = { todos: Todo[] };

const initialState: BoardState = {
  order: {
    todo: [],
    done: [],
  },
  filter: "all",
  search: "",
  confirmDeleteId: null,
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    seed(state, action: PayloadAction<SeedPayload>) {
      const idsByStatus: Record<Status, number[]> = {
        todo: [],
        done: [],
      };
      for (const t of action.payload.todos) {
        idsByStatus[t.status].push(t.id);
      }
      state.order = idsByStatus;
    },
    setFilter(state, action: PayloadAction<BoardState["filter"]>) {
      state.filter = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    openDeleteConfirm(state, action: PayloadAction<number>) {
      state.confirmDeleteId = action.payload;
    },
    closeDeleteConfirm(state) {
      state.confirmDeleteId = null;
    },
    reorder(
      state,
      action: PayloadAction<{
        from: Status;
        to: Status;
        fromIndex: number;
        toIndex: number;
        id: number;
      }>
    ) {
      const { from, to, fromIndex, toIndex, id } = action.payload;
      state.order[from].splice(fromIndex, 1);
      state.order[to].splice(toIndex, 0, id);
    },
    pushNew(state, action: PayloadAction<{ id: number }>) {
      state.order.todo.unshift(action.payload.id);
    },
    yank(state, action: PayloadAction<{ id: number }>) {
      for (const col of Object.keys(state.order) as Status[]) {
        state.order[col] = state.order[col].filter(
          (x) => x !== action.payload.id
        );
      }
    },
    moveTo(
      state,
      action: PayloadAction<{ id: number; from: Status; to: Status }>
    ) {
      const { id, from, to } = action.payload;
      if (from === to) return;
      state.order[from] = state.order[from].filter((x) => x !== id);
      state.order[to].unshift(id);
    },
    pushNewTo(state, action: PayloadAction<{ id: number; status: Status }>) {
      state.order[action.payload.status].unshift(action.payload.id);
    },

    replaceId(
      state,
      action: PayloadAction<{ tempId: number; realId: number }>
    ) {
      (Object.keys(state.order) as Status[]).forEach((col) => {
        state.order[col] = state.order[col].map((x) =>
          x === action.payload.tempId ? action.payload.realId : x
        );
      });
    },
  },
});

export const actions = boardSlice.actions;
export default boardSlice.reducer;

// Selector hook
export const useBoard = () => (state: RootState) => state.board;
export const selectBoard = (state: RootState) => state.board;
