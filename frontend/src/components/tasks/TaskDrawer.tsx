import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { tasksApi } from "@/api/tasks";
import { projectsApi } from "@/api/projects";
import { qk } from "@/lib/queryKeys";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { canEditTask, canUpdateTaskStatus, canDeleteTask } from "@/lib/permissions";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { formatDate } from "@/lib/format";
import type { TaskPriority, TaskStatus } from "@/types/api";

export function TaskDrawer({
  taskId,
  projectId,
  open,
  onOpenChange,
}: {
  taskId: string | null;
  projectId?: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();

  const { data: task, isLoading } = useQuery({
    queryKey: taskId ? qk.task(taskId) : ["tasks", "none"],
    queryFn: () => tasksApi.get(taskId!),
    enabled: !!taskId && open,
  });

  const effectiveProjectId = projectId ?? task?.projectId;

  const { data: project } = useQuery({
    queryKey: effectiveProjectId ? qk.project(effectiveProjectId) : ["projects", "none"],
    queryFn: () => projectsApi.get(effectiveProjectId!),
    enabled: !!effectiveProjectId && open,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("UNASSIGNED");
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
      setAssigneeId(task.assigneeId ?? task.assignee?.id ?? "UNASSIGNED");
    }
  }, [task]);

  const isAdmin = canEditTask(project, user?.id);
  const canFullEdit = isAdmin;
  const canStatus = canUpdateTaskStatus(project, task, user?.id);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.dashboard });
    if (effectiveProjectId) {
      qc.invalidateQueries({ queryKey: qk.projectTasks(effectiveProjectId) });
      qc.invalidateQueries({ queryKey: qk.project(effectiveProjectId) });
    }
    if (taskId) qc.invalidateQueries({ queryKey: qk.task(taskId) });
  };

  const updateM = useMutation({
    mutationFn: () =>
      tasksApi.update(taskId!, {
        title: canFullEdit ? title : undefined,
        description: canFullEdit ? description : undefined,
        status,
        priority: canFullEdit ? priority : undefined,
        dueDate: canFullEdit ? dueDate || null : undefined,
        assigneeId: canFullEdit ? (assigneeId === "UNASSIGNED" ? null : assigneeId) : undefined,
      }),
    onSuccess: () => {
      toast.success("Task updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteM = useMutation({
    mutationFn: () => tasksApi.remove(taskId!),
    onSuccess: () => {
      toast.success("Task deleted");
      invalidate();
      setConfirmDel(false);
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Task details</SheetTitle>
            <SheetDescription>{task?.project?.name ?? project?.name ?? "Project"}</SheetDescription>
          </SheetHeader>
          {isLoading || !task ? (
            <div className="space-y-3 px-4 py-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ) : (
            <div className="space-y-4 px-4 py-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!canFullEdit}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!canFullEdit}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as TaskStatus)}
                    disabled={!canStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">Todo</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(v) => setPriority(v as TaskPriority)}
                    disabled={!canFullEdit}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Due date</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={!canFullEdit}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Assignee</Label>
                  <Select value={assigneeId} onValueChange={setAssigneeId} disabled={!canFullEdit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                      {project?.members?.map((m) => (
                        <SelectItem key={m.user.id} value={m.user.id}>
                          {m.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <div>
                  Created by {task.createdBy?.name ?? "—"} · {formatDate(task.createdAt)}
                </div>
                <div>Updated {formatDate(task.updatedAt)}</div>
              </div>
            </div>
          )}
          <SheetFooter className="gap-2 px-4 pb-4">
            {canDeleteTask(project, user?.id) && task && (
              <Button
                variant="destructive"
                onClick={() => setConfirmDel(true)}
                className="sm:mr-auto"
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {(canFullEdit || canStatus) && task && (
              <Button onClick={() => updateM.mutate()} disabled={updateM.isPending}>
                {updateM.isPending ? "Saving…" : "Save changes"}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={confirmDel}
        onOpenChange={setConfirmDel}
        title="Delete this task?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteM.isPending}
        onConfirm={() => deleteM.mutate()}
      />
    </>
  );
}
