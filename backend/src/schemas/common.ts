import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().min(1)
});

export const taskIdParamSchema = z.object({
  taskId: z.string().min(1)
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export function getPagination(page: number, pageSize: number) {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize
  };
}
