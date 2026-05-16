import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { TaskStatus, TaskPriority, Member } from "@/types/api";

export interface TaskFiltersValue {
  search: string;
  status: TaskStatus | "ALL";
  priority: TaskPriority | "ALL";
  assigneeId: string | "ALL";
  overdueOnly: boolean;
}

export const defaultFilters: TaskFiltersValue = {
  search: "",
  status: "ALL",
  priority: "ALL",
  assigneeId: "ALL",
  overdueOnly: false,
};

export function TaskFilters({
  value,
  onChange,
  members,
}: {
  value: TaskFiltersValue;
  onChange: (v: TaskFiltersValue) => void;
  members?: Member[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search tasks…"
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
        className="h-9 w-full sm:w-56"
      />
      <Select
        value={value.status}
        onValueChange={(v) => onChange({ ...value, status: v as TaskFiltersValue["status"] })}
      >
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="TODO">Todo</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={value.priority}
        onValueChange={(v) => onChange({ ...value, priority: v as TaskFiltersValue["priority"] })}
      >
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All priorities</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
        </SelectContent>
      </Select>
      {members && (
        <Select
          value={value.assigneeId}
          onValueChange={(v) => onChange({ ...value, assigneeId: v })}
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All assignees</SelectItem>
            <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.user.id} value={m.user.id}>
                {m.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Label className="ml-1 flex items-center gap-2 text-sm font-normal text-muted-foreground">
        <Checkbox
          checked={value.overdueOnly}
          onCheckedChange={(c) => onChange({ ...value, overdueOnly: !!c })}
        />
        Overdue only
      </Label>
    </div>
  );
}

export function applyFilters<
  T extends {
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId?: string | null;
    dueDate?: string | null;
  },
>(tasks: T[], f: TaskFiltersValue, isOverdueFn: (t: T) => boolean): T[] {
  return tasks.filter((t) => {
    if (f.search && !t.title.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (f.status !== "ALL" && t.status !== f.status) return false;
    if (f.priority !== "ALL" && t.priority !== f.priority) return false;
    if (f.assigneeId === "UNASSIGNED" && t.assigneeId) return false;
    if (f.assigneeId !== "ALL" && f.assigneeId !== "UNASSIGNED" && t.assigneeId !== f.assigneeId)
      return false;
    if (f.overdueOnly && !isOverdueFn(t)) return false;
    return true;
  });
}
