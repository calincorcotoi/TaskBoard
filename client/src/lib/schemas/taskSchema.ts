import { z } from "zod";

export const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(2000).optional(),
    assigneeId: z.string().optional(),
    dueDate: z.string().optional(),
    labels: z.string().max(500).optional()
});

export type TaskSchema = z.infer<typeof taskSchema>;
