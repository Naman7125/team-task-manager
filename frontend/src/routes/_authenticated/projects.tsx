import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, FolderKanban } from "lucide-react";
import { projectsApi } from "@/api/projects";
import { qk } from "@/lib/queryKeys";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";
import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/types/api";

export const Route = createFileRoute("/_authenticated/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: qk.projects,
    queryFn: projectsApi.list,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "ALL">("ALL");
  const [openCreate, setOpenCreate] = useState(false);
  const { role, roleLabel, canCreateProject } = useWorkspaceRole();

  const filtered = useMemo(() => {
    return (projects ?? []).filter((p) => {
      if (status !== "ALL" && p.status !== status) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [projects, search, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description={
          role === "MEMBER"
            ? "Member view: inspect project work and update only assigned task status."
            : "Admin view: manage projects, members, roles, and task assignments."
        }
        actions={
          <>
            <Badge variant={role === "ADMIN" ? "default" : "secondary"}>{roleLabel}</Badge>
            {canCreateProject && (
              <Button onClick={() => setOpenCreate(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> New project
              </Button>
            )}
          </>
        }
      />
      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-[1fr_auto] sm:flex sm:flex-wrap sm:items-center">
        <Input
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full sm:h-9 sm:w-64"
        />
        <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus | "ALL")}>
          <SelectTrigger className="h-10 w-full sm:h-9 sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        projects && projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            message="No projects yet. Create your first project to start organizing team work."
            actionLabel="Create Project"
            onAction={() => setOpenCreate(true)}
          />
        ) : (
          <EmptyState title="No matches" message="No matching results found." />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <CreateProjectDialog open={openCreate} onOpenChange={setOpenCreate} />
    </div>
  );
}
