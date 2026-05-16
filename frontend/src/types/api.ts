export type Role = "ADMIN" | "MEMBER";
export type ProjectStatus = "ACTIVE" | "ARCHIVED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Member {
  id?: string;
  userId: string;
  role: Role;
  joinedAt?: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  taskCount?: number;
  memberCount?: number;
  members?: Member[];
  updatedAt?: string;
  createdAt?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  assignee?: User | null;
  createdById?: string;
  createdBy?: User | null;
  project?: Pick<Project, "id" | "name"> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardData {
  totals: {
    projects: number;
    tasks: number;
    assignedToMe: number;
    overdue: number;
    dueSoon: number;
  };
  statusBreakdown: { TODO: number; IN_PROGRESS: number; DONE: number };
  recentTasks: Task[];
  overdueTasks: Task[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
