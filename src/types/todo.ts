// Matches DummyJSON API response
export type RemoteTodo = {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
};

// Client-side status options
export type Status = "todo" | "done";

// Our local Todo model
export type Todo = {
  id: number;
  title: string;
  status: Status;
  userId: number;
};

// Form values for creating/updating todos
export type TodoForm = {
  title: string;
  status: Status;
};
