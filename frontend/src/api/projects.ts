import { api } from "./client";
import type { Project, Member, Role } from "@/types/api";

type BackendMember = Omit<Member, "userId" | "joinedAt"> & {
  userId?: string;
  createdAt?: string;
  joinedAt?: string;
};

type BackendProject = Project & {
  _count?: {
    tasks?: number;
    members?: number;
  };
  members?: BackendMember[];
};

const normalizeMember = (member: BackendMember): Member => ({
  ...member,
  userId: member.userId ?? member.user.id,
  joinedAt: member.joinedAt ?? member.createdAt,
});

const normalizeProject = (project: BackendProject): Project => ({
  ...project,
  taskCount: project.taskCount ?? project._count?.tasks ?? 0,
  memberCount: project.memberCount ?? project._count?.members ?? project.members?.length ?? 0,
  members: project.members?.map(normalizeMember),
});

export const projectsApi = {
  list: async () => (await api<BackendProject[]>("/api/projects")).map(normalizeProject),
  get: async (id: string) => normalizeProject(await api<BackendProject>(`/api/projects/${id}`)),
  create: async (data: { name: string; description?: string }) =>
    normalizeProject(
      await api<BackendProject>("/api/projects", { method: "POST", body: JSON.stringify(data) }),
    ),
  update: async (id: string, data: Partial<Pick<Project, "name" | "description" | "status">>) =>
    normalizeProject(
      await api<BackendProject>(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    ),
  remove: (id: string) => api<void>(`/api/projects/${id}`, { method: "DELETE" }),
  members: async (id: string) =>
    (await api<BackendMember[]>(`/api/projects/${id}/members`)).map(normalizeMember),
  addMember: async (id: string, data: { email: string; role: Role }) =>
    normalizeMember(
      await api<BackendMember>(`/api/projects/${id}/members`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ),
  updateMember: async (id: string, userId: string, data: { role: Role }) =>
    normalizeMember(
      await api<BackendMember>(`/api/projects/${id}/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    ),
  removeMember: (id: string, userId: string) =>
    api<void>(`/api/projects/${id}/members/${userId}`, { method: "DELETE" }),
};
