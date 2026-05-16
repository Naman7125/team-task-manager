import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, formatDate, isOverdue } from "@/lib/format";
import { StatusBadge, PriorityBadge } from "./Badges";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/api";

export function TaskCard({ task, onClick }: { task: Task; onClick?: () => void }) {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-md border border-border bg-card p-3 text-left transition-all hover:border-primary/40 hover:shadow-sm",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-medium text-foreground">{task.title}</p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} className="text-[10px] px-1.5 py-0" />
        <StatusBadge status={task.status} className="text-[10px] px-1.5 py-0" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex min-w-0 items-center gap-1.5">
          {task.assignee ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">
                  {initials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{task.assignee.name}</span>
            </>
          ) : (
            <span className="italic">Unassigned</span>
          )}
        </div>
        {task.dueDate && (
          <span className={cn("flex items-center gap-1", overdue && "text-destructive")}>
            {overdue && <AlertTriangle className="h-3 w-3" />}
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </button>
  );
}
