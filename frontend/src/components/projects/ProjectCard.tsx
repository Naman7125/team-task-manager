import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ListChecks } from "lucide-react";
import { formatRelative } from "@/lib/format";
import type { Project } from "@/types/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getMyMembership } from "@/lib/permissions";

export function ProjectCard({ project }: { project: Project }) {
  const { data: user } = useCurrentUser();
  const membership = getMyMembership(project, user?.id);

  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project.id }}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      <Card className="h-full border-border/70 bg-card hover-lift hover:border-brand/40">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display line-clamp-1 text-xl font-medium text-foreground">
              {project.name}
            </h3>
            <Badge
              variant={project.status === "ACTIVE" ? "secondary" : "outline"}
              className="shrink-0 capitalize"
            >
              {project.status.toLowerCase()}
            </Badge>
          </div>
          <div className="mt-2">
            <Badge
              variant={membership?.role === "ADMIN" ? "default" : "secondary"}
              className={
                membership?.role === "ADMIN"
                  ? "bg-brand text-brand-foreground"
                  : "text-muted-foreground"
              }
            >
              {membership?.role === "ADMIN" ? "Admin access" : "Member access"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
            {project.description || "No description"}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <ListChecks className="h-3.5 w-3.5" /> {project.taskCount ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />{" "}
                {project.memberCount ?? project.members?.length ?? 0}
              </span>
            </div>
            <span>{formatRelative(project.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
