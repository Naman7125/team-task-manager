import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/api/projects";
import { qk } from "@/lib/queryKeys";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export type WorkspaceRole = "ADMIN" | "MEMBER" | "NONE";

export function useWorkspaceRole() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: qk.projects,
    queryFn: projectsApi.list,
  });

  const memberships = (projects ?? []).flatMap((project) =>
    (project.members ?? [])
      .filter((member) => member.user.id === user?.id || member.userId === user?.id)
      .map((member) => ({ project, member })),
  );
  const adminProjects = memberships.filter(({ member }) => member.role === "ADMIN");
  const memberProjects = memberships.filter(({ member }) => member.role === "MEMBER");
  const role: WorkspaceRole =
    adminProjects.length > 0 ? "ADMIN" : memberProjects.length > 0 ? "MEMBER" : "NONE";

  return {
    role,
    roleLabel: role === "ADMIN" ? "Admin" : role === "MEMBER" ? "Member" : "No role yet",
    canCreateProject: role !== "MEMBER",
    adminProjectCount: adminProjects.length,
    memberProjectCount: memberProjects.length,
    projectCount: projects?.length ?? 0,
    isLoading: userLoading || projectsLoading,
  };
}
