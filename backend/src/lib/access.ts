import { ProjectRole } from "@prisma/client";
import { forbidden, notFound } from "./errors";
import { prisma } from "./prisma";

export async function getMembership(projectId: string, userId: string) {
  return prisma.projectMembership.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
}

export async function requireProjectMember(projectId: string, userId: string) {
  const membership = await getMembership(projectId, userId);
  if (!membership) {
    throw notFound("Project not found");
  }
  return membership;
}

export async function requireProjectAdmin(projectId: string, userId: string) {
  const membership = await requireProjectMember(projectId, userId);
  if (membership.role !== ProjectRole.ADMIN) {
    throw forbidden("Project admin role required");
  }
  return membership;
}

export async function isProjectMember(projectId: string, userId: string) {
  const membership = await getMembership(projectId, userId);
  return Boolean(membership);
}
