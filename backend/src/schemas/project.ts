import { ProjectRole, ProjectStatus } from "@prisma/client";
import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional()
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  status: z.nativeEnum(ProjectStatus).optional()
});

export const projectListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(ProjectStatus).optional(),
  search: z.string().trim().max(120).optional()
});

export const addMemberSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  role: z.nativeEnum(ProjectRole).default(ProjectRole.MEMBER)
});

export const updateMemberSchema = z.object({
  role: z.nativeEnum(ProjectRole)
});

export const memberParamSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1)
});
