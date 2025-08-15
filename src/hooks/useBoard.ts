import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { actions as boardActions } from "../store/boardSlice";

// Typed Redux helpers
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Select the board slice
export const useBoard = () => useAppSelector((state) => state.board);

// Re-export board actions for convenience (optional)
export const actions = boardActions;
