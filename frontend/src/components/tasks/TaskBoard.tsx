import { TaskCard } from "./TaskCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ListChecks } from "lucide-react";
import type { Task, TaskStatus } from "@/types/api";

const columns: { status: TaskStatus; label: string }[] = [
  { status: "TODO", label: "Todo" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "DONE", label: "Done" },
];

export function TaskBoard({
  tasks,
  onSelect,
  onCreate,
}: {
  tasks: Task[];
  onSelect: (t: Task) => void;
  onCreate?: () => void;
}) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No tasks yet"
        message="No tasks yet. Add a task and assign it to a team member."
        actionLabel={onCreate ? "Create Task" : undefined}
        onAction={onCreate}
      />
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((col) => {
        const items = tasks.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className="flex min-h-[200px] flex-col rounded-lg border border-border bg-card/50 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">{col.label}</h4>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((t) => (
                <TaskCard key={t.id} task={t} onClick={() => onSelect(t)} />
              ))}
              {items.length === 0 && (
                <p className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                  No tasks
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
