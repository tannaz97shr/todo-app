import { configureStore } from "@reduxjs/toolkit";
import boardReducer from "./boardSlice";

// Create the store
export const store = configureStore({
  reducer: {
    board: boardReducer,
  },
});

// Types for hooks and usage
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
