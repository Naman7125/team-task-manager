import { api } from "./client";
import type { DashboardData } from "@/types/api";
import { isOverdue } from "@/lib/format";

type BackendDashboard = {
  projects: number;
  tasks: {
    total: number;
    assignedToMe: number;
    overdue: number;
    dueSoon: number;
    byStatus: DashboardData["statusBreakdown"];
  };
  latestTasks: DashboardData["recentTasks"];
};

export const dashboardApi = {
  get: async () => {
    const data = await api<BackendDashboard>("/api/dashboard");
    return {
      totals: {
        projects: data.projects,
        tasks: data.tasks.total,
        assignedToMe: data.tasks.assignedToMe,
        overdue: data.tasks.overdue,
        dueSoon: data.tasks.dueSoon,
      },
      statusBreakdown: data.tasks.byStatus,
      recentTasks: data.latestTasks,
      overdueTasks: data.latestTasks.filter((task) => isOverdue(task.dueDate, task.status)),
    } satisfies DashboardData;
  },
};
