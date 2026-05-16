import type { Project, Task, Member } from "@/types/api";

export function getMyMembership(
  project: Project | undefined,
  userId: string | undefined,
): Member | undefined {
  if (!project || !userId) return undefined;
  return project.members?.find((m) => m.user.id === userId || m.userId === userId);
}

export function isProjectAdmin(project: Project | undefined, userId: string | undefined): boolean {
  return getMyMembership(project, userId)?.role === "ADMIN";
}

export function canEditProject(project: Project | undefined, userId: string | undefined) {
  return isProjectAdmin(project, userId);
}
export const canDeleteProject = canEditProject;
export const canArchiveProject = canEditProject;
export const canManageMembers = canEditProject;
export const canCreateTask = canEditProject;
export const canDeleteTask = canEditProject;

export function canEditTask(project: Project | undefined, userId: string | undefined) {
  return isProjectAdmin(project, userId);
}

export function canUpdateTaskStatus(
  project: Project | undefined,
  task: Task | undefined,
  userId: string | undefined,
) {
  if (!task || !userId) return false;
  if (isProjectAdmin(project, userId)) return true;
  return task.assigneeId === userId || task.assignee?.id === userId;
}

export function adminCount(members: Member[] | undefined) {
  return (members ?? []).filter((m) => m.role === "ADMIN").length;
}
