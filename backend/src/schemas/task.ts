import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";
import { paginationQuerySchema } from "./common";

const optionalDate = z
  .string()
  .datetime()
  .or(z.string().date())
  .transform((value) => new Date(value))
  .optional();

export const taskListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().min(1).optional(),
  overdue: z.coerce.boolean().optional()
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: optionalDate,
  assigneeId: z.string().min(1).nullable().optional()
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: optionalDate.nullable().optional(),
  assigneeId: z.string().min(1).nullable().optional()
});
