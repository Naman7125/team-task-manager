import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "./Badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, formatDate, isOverdue } from "@/lib/format";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";
import { ListChecks } from "lucide-react";
import type { Task } from "@/types/api";

export function TaskTable({
  tasks,
  onSelect,
  onCreate,
  showProject,
}: {
  tasks: Task[];
  onSelect: (t: Task) => void;
  onCreate?: () => void;
  showProject?: boolean;
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
    <>
      <div className="space-y-3 md:hidden">
        {tasks.map((t) => {
          const overdue = isOverdue(t.dueDate, t.status);
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors active:bg-accent/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="line-clamp-2 font-medium text-foreground">{t.title}</div>
                  {showProject && (
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {t.project?.name ?? "Project"}
                    </div>
                  )}
                </div>
                {t.dueDate && (
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1 text-xs",
                      overdue ? "text-destructive font-medium" : "text-muted-foreground",
                    )}
                  >
                    {overdue && <AlertTriangle className="h-3.5 w-3.5" />}
                    {formatDate(t.dueDate)}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={t.status} />
                <PriorityBadge priority={t.priority} />
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                {t.assignee ? (
                  <>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {initials(t.assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{t.assignee.name}</span>
                  </>
                ) : (
                  <span className="italic">Unassigned</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              {showProject && <TableHead>Project</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((t) => {
              const overdue = isOverdue(t.dueDate, t.status);
              return (
                <TableRow key={t.id} className="cursor-pointer" onClick={() => onSelect(t)}>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  {showProject && (
                    <TableCell className="text-muted-foreground">
                      {t.project?.name ?? "—"}
                    </TableCell>
                  )}
                  <TableCell>
                    <StatusBadge status={t.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={t.priority} />
                  </TableCell>
                  <TableCell>
                    {t.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">
                            {initials(t.assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{t.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className={cn("text-sm", overdue && "text-destructive font-medium")}>
                    {t.dueDate ? (
                      <span className="flex items-center gap-1">
                        {overdue && <AlertTriangle className="h-3.5 w-3.5" />}
                        {formatDate(t.dueDate)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
