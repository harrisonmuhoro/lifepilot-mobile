import { z } from 'zod';

export const taskPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);
export const taskStatusEnum = z.enum([
  'pending',
  'in_progress',
  'completed',
  'archived',
]);

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  priority: taskPriorityEnum.default('medium'),
  status: taskStatusEnum.default('pending'),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
    .optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
