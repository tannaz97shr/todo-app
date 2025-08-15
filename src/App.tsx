import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import Board from "./components/Board";
import { store } from "./store";

const queryClient = new QueryClient();

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-dvh bg-gray-100">
          <Board />
        </div>
      </QueryClientProvider>
    </Provider>
  );
}
