import { z } from "zod";

// Keep enum in one place so you can reuse it across forms
export const StatusEnum = z.enum(["todo", "done"]);

// Create / Edit form schema
export const TodoSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Max 120 chars"),
  status: StatusEnum.default("todo"),
});

// Useful for mutation payloads (PATCH)
export const UpdateTodoSchema = z
  .object({
    id: z.number().int().positive(),
    title: z
      .string()
      .min(1, "Title is required")
      .max(120, "Max 120 chars")
      .optional(),
    status: StatusEnum.optional(),
  })
  .refine((d) => d.title !== undefined || d.status !== undefined, {
    message: "Provide at least one field to update (title or status).",
    path: ["title"],
  });

// Delete payload
export const DeleteTodoSchema = z.object({
  id: z.number().int().positive(),
});

// Filter/search bar schema (optional)
export const FilterSchema = z.object({
  search: z.string().default(""),
  filter: z.union([StatusEnum, z.literal("all")]).default("all"),
});

// Types
export type TodoFormInput = z.infer<typeof TodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
export type DeleteTodoInput = z.infer<typeof DeleteTodoSchema>;
export type FilterInput = z.infer<typeof FilterSchema>;
