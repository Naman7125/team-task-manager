import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ListChecks } from "lucide-react";
import { projectsApi } from "@/api/projects";
import { tasksApi } from "@/api/tasks";
import { qk } from "@/lib/queryKeys";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskTable } from "@/components/tasks/TaskTable";
import {
  TaskFilters,
  defaultFilters,
  applyFilters,
  type TaskFiltersValue,
} from "@/components/tasks/TaskFilters";
import { TaskDrawer } from "@/components/tasks/TaskDrawer";
import { EmptyState } from "@/components/common/EmptyState";
import { isOverdue } from "@/lib/format";
import type { Task } from "@/types/api";

const searchSchema = z.object({ overdue: z.boolean().optional() });

export const Route = createFileRoute("/_authenticated/tasks")({
  validateSearch: searchSchema,
  component: TasksPage,
});

function TasksPage() {
  const search = Route.useSearch();
  const { data: user } = useCurrentUser();
  const { data: projects, isLoading: lp } = useQuery({
    queryKey: qk.projects,
    queryFn: projectsApi.list,
  });

  const projectIds = (projects ?? []).map((p) => p.id);
  const taskQueries = useQueries({
    queries: projectIds.map((id) => ({
      queryKey: qk.projectTasks(id),
      queryFn: () => tasksApi.listByProject(id),
      enabled: !!projects,
    })),
  });

  const allTasks: Task[] = useMemo(() => {
    const out: Task[] = [];
    taskQueries.forEach((q, i) => {
      const proj = projects?.[i];
      (q.data ?? []).forEach((t) => {
        out.push({ ...t, project: proj ? { id: proj.id, name: proj.name } : t.project });
      });
    });
    return out;
  }, [taskQueries, projects]);

  const myTasks = useMemo(
    () => allTasks.filter((t) => t.assigneeId === user?.id || t.assignee?.id === user?.id),
    [allTasks, user?.id],
  );

  const [filters, setFilters] = useState<TaskFiltersValue>({
    ...defaultFilters,
    overdueOnly: !!search.overdue,
  });
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);

  const filtered = useMemo(
    () => applyFilters(myTasks, filters, (t) => isOverdue(t.dueDate, t.status)),
    [myTasks, filters],
  );

  const isLoading = lp || taskQueries.some((q) => q.isLoading);

  return (
    <div className="space-y-6">
      <PageHeader title="My tasks" description="Tasks assigned to you across every project." />
      <TaskFilters value={filters} onChange={setFilters} />
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : myTasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No tasks assigned"
          message="No tasks yet. Add a task and assign it to a team member."
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matches" message="No matching results found." />
      ) : (
        <TaskTable tasks={filtered} onSelect={(t) => setOpenDrawerId(t.id)} showProject />
      )}
      <TaskDrawer
        taskId={openDrawerId}
        open={!!openDrawerId}
        onOpenChange={(o) => !o && setOpenDrawerId(null)}
      />
    </div>
  );
}
