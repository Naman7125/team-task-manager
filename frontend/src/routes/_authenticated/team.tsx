import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { projectsApi } from "@/api/projects";
import { qk } from "@/lib/queryKeys";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { initials } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/team")({
  component: TeamPage,
});

function TeamPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: qk.projects,
    queryFn: projectsApi.list,
  });
  const memberQueries = useQueries({
    queries: (projects ?? []).map((p) => ({
      queryKey: qk.projectMembers(p.id),
      queryFn: () => projectsApi.members(p.id),
      enabled: !!projects,
    })),
  });

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { user: { id: string; name: string; email: string }; projects: string[]; roles: Set<string> }
    >();
    memberQueries.forEach((q, i) => {
      const project = projects?.[i];
      (q.data ?? []).forEach((m) => {
        const existing = map.get(m.user.id) ?? {
          user: m.user,
          projects: [],
          roles: new Set<string>(),
        };
        if (project) existing.projects.push(project.name);
        existing.roles.add(m.role);
        map.set(m.user.id, existing);
      });
    });
    return Array.from(map.values());
  }, [memberQueries, projects]);

  const loading = isLoading || memberQueries.some((q) => q.isLoading);

  return (
    <div className="space-y-6">
      <PageHeader title="Team" description="Everyone you collaborate with across projects." />
      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teammates yet"
          message="Add members to your projects to see them here."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {grouped.map((g) => (
            <Card key={g.user.id}>
              <CardContent className="flex items-start gap-3 py-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{initials(g.user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{g.user.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{g.user.email}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Array.from(g.roles).map((r) => (
                      <Badge
                        key={r}
                        variant={r === "ADMIN" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {r}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {g.projects.join(", ")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
