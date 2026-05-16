export const qk = {
  me: ["me"] as const,
  dashboard: ["dashboard"] as const,
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  projectTasks: (id: string) => ["projects", id, "tasks"] as const,
  projectMembers: (id: string) => ["projects", id, "members"] as const,
  task: (id: string) => ["tasks", id] as const,
  userSearch: (q: string) => ["users", "search", q] as const,
};
