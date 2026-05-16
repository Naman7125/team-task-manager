import { Badge } from "@/components/ui/badge";
import type { TaskStatus, TaskPriority } from "@/types/api";
import { cn } from "@/lib/utils";

const statusStyles: Record<TaskStatus, string> = {
  TODO: "bg-muted text-muted-foreground border-border",
  IN_PROGRESS: "bg-info/10 text-info border-info/20",
  DONE: "bg-success/10 text-success border-success/20",
};
const statusLabels: Record<TaskStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", statusStyles[status], className)}>
      {statusLabels[status]}
    </Badge>
  );
}

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "bg-muted text-muted-foreground border-border",
  MEDIUM: "bg-warning/15 text-warning-foreground border-warning/30",
  HIGH: "bg-destructive/10 text-destructive border-destructive/20",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium capitalize", priorityStyles[priority], className)}
    >
      {priority.toLowerCase()}
    </Badge>
  );
}
