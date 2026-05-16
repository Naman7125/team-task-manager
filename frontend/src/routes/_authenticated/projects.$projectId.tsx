import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import {
  ChevronLeft,
  MoreVertical,
  Plus,
  LayoutGrid,
  List as ListIcon,
  Trash2,
  Archive,
} from "lucide-react";
import { projectsApi } from "@/api/projects";
import { tasksApi } from "@/api/tasks";
import { qk } from "@/lib/queryKeys";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  isProjectAdmin,
  canCreateTask,
  canManageMembers,
  canDeleteProject,
} from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TaskTable } from "@/components/tasks/TaskTable";
import {
  TaskFilters,
  defaultFilters,
  applyFilters,
  type TaskFiltersValue,
} from "@/components/tasks/TaskFilters";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { TaskDrawer } from "@/components/tasks/TaskDrawer";
import { MemberList } from "@/components/members/MemberList";
import { AddMemberDialog } from "@/components/members/AddMemberDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { initials, formatRelative, formatDate, isOverdue } from "@/lib/format";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();

  const { data: project, isLoading } = useQuery({
    queryKey: qk.project(projectId),
    queryFn: () => projectsApi.get(projectId),
  });
  const { data: tasks } = useQuery({
    queryKey: qk.projectTasks(projectId),
    queryFn: () => tasksApi.listByProject(projectId),
  });
  const { data: members } = useQuery({
    queryKey: qk.projectMembers(projectId),
    queryFn: () => projectsApi.members(projectId),
  });

  const admin = isProjectAdmin(project, user?.id);

  const [view, setView] = useState<"board" | "table">("board");
  const [filters, setFilters] = useState<TaskFiltersValue>(defaultFilters);
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [openAddMember, setOpenAddMember] = useState(false);
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [openDeleteProj, setOpenDeleteProj] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const memberList = members ?? project?.members ?? [];

  const filteredTasks = useMemo(() => {
    return applyFilters(tasks ?? [], filters, (t) => isOverdue(t.dueDate, t.status));
  }, [tasks, filters]);

  const updateProjM = useMutation({
    mutationFn: (data: { name?: string; description?: string; status?: "ACTIVE" | "ARCHIVED" }) =>
      projectsApi.update(projectId, data),
    onSuccess: () => {
      toast.success("Project updated");
      qc.invalidateQueries({ queryKey: qk.project(projectId) });
      qc.invalidateQueries({ queryKey: qk.projects });
      setEditing(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteProjM = useMutation({
    mutationFn: () => projectsApi.remove(projectId),
    onSuccess: () => {
      toast.success("Project deleted");
      qc.invalidateQueries({ queryKey: qk.projects });
      navigate({ to: "/projects" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !project) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const startEdit = () => {
    setEditName(project.name);
    setEditDesc(project.description ?? "");
    setEditing(true);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z
      .object({
        name: z.string().trim().min(1).max(80),
        description: z.string().trim().max(500).optional(),
      })
      .safeParse({ name: editName, description: editDesc || undefined });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid");
      return;
    }
    updateProjM.mutate(parsed.data);
  };

  const taskCounts = {
    TODO: (tasks ?? []).filter((t) => t.status === "TODO").length,
    IN_PROGRESS: (tasks ?? []).filter((t) => t.status === "IN_PROGRESS").length,
    DONE: (tasks ?? []).filter((t) => t.status === "DONE").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Projects
        </Link>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{project.name}</h1>
            <Badge
              variant={project.status === "ACTIVE" ? "secondary" : "outline"}
              className="capitalize"
            >
              {project.status.toLowerCase()}
            </Badge>
          </div>
          {project.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
        {admin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  updateProjM.mutate({
                    status: project.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE",
                  })
                }
              >
                <Archive className="mr-2 h-4 w-4" />{" "}
                {project.status === "ACTIVE" ? "Archive" : "Unarchive"}
              </DropdownMenuItem>
              {canDeleteProject(project, user?.id) && (
                <DropdownMenuItem
                  onClick={() => setOpenDeleteProj(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase text-muted-foreground">Todo</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{taskCounts.TODO}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase text-muted-foreground">
                  In progress
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{taskCounts.IN_PROGRESS}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase text-muted-foreground">Done</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{taskCounts.DONE}</CardContent>
            </Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Recent tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {(tasks ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks yet.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {(tasks ?? []).slice(0, 6).map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-2 py-2 text-sm"
                      >
                        <button
                          onClick={() => setOpenDrawerId(t.id)}
                          className="line-clamp-1 text-left font-medium hover:underline"
                        >
                          {t.title}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          {formatRelative(t.updatedAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Members ({memberList.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {memberList.map((m) => (
                    <div
                      key={m.user.id}
                      className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-2 py-1 text-xs"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {initials(m.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      {m.user.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TaskFilters value={filters} onChange={setFilters} members={memberList} />
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border border-border p-0.5">
                <Button
                  size="sm"
                  variant={view === "board" ? "secondary" : "ghost"}
                  onClick={() => setView("board")}
                  className="h-7 px-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={view === "table" ? "secondary" : "ghost"}
                  onClick={() => setView("table")}
                  className="h-7 px-2"
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>
              {canCreateTask(project, user?.id) && (
                <Button size="sm" onClick={() => setOpenCreateTask(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> New task
                </Button>
              )}
            </div>
          </div>
          {view === "board" ? (
            <TaskBoard
              tasks={filteredTasks}
              onSelect={(t) => setOpenDrawerId(t.id)}
              onCreate={
                canCreateTask(project, user?.id) ? () => setOpenCreateTask(true) : undefined
              }
            />
          ) : (
            <TaskTable
              tasks={filteredTasks}
              onSelect={(t) => setOpenDrawerId(t.id)}
              onCreate={
                canCreateTask(project, user?.id) ? () => setOpenCreateTask(true) : undefined
              }
            />
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{memberList.length} members</p>
            {canManageMembers(project, user?.id) && (
              <Button size="sm" onClick={() => setOpenAddMember(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Add member
              </Button>
            )}
          </div>
          <MemberList
            projectId={projectId}
            members={memberList}
            canManage={canManageMembers(project, user?.id)}
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {!admin ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                Only project admins can change settings.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Project settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editing ? (
                  <>
                    <div>
                      <div className="text-xs text-muted-foreground">Name</div>
                      <div className="text-sm">{project.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Description</div>
                      <div className="text-sm">{project.description || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Created</div>
                      <div className="text-sm">{formatDate(project.createdAt)}</div>
                    </div>
                    <Button size="sm" onClick={startEdit}>
                      Edit details
                    </Button>
                  </>
                ) : (
                  <form onSubmit={submitEdit} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Name</Label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={updateProjM.isPending}>
                        {updateProjM.isPending ? "Saving…" : "Save"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateTaskDialog
        open={openCreateTask}
        onOpenChange={setOpenCreateTask}
        projectId={projectId}
        members={memberList}
      />
      <AddMemberDialog open={openAddMember} onOpenChange={setOpenAddMember} projectId={projectId} />
      <TaskDrawer
        taskId={openDrawerId}
        projectId={projectId}
        open={!!openDrawerId}
        onOpenChange={(o) => !o && setOpenDrawerId(null)}
      />
      <ConfirmDialog
        open={openDeleteProj}
        onOpenChange={setOpenDeleteProj}
        title="Delete this project?"
        description="All tasks and member assignments will be removed. This cannot be undone."
        confirmLabel="Delete project"
        destructive
        loading={deleteProjM.isPending}
        onConfirm={() => deleteProjM.mutate()}
      />
    </div>
  );
}
