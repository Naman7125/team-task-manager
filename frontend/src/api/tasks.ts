import { api } from "./client";
import type { Task, TaskStatus, TaskPriority } from "@/types/api";

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export const tasksApi = {
  listByProject: (projectId: string) => api<Task[]>(`/api/projects/${projectId}/tasks`),
  create: (projectId: string, data: TaskInput) =>
    api<Task>(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  get: (taskId: string) => api<Task>(`/api/tasks/${taskId}`),
  update: (taskId: string, data: Partial<TaskInput>) =>
    api<Task>(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (taskId: string) => api<void>(`/api/tasks/${taskId}`, { method: "DELETE" }),
};
