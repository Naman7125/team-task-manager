import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FolderKanban, ListChecks, Users, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Tasks", url: "/tasks", icon: ListChecks },
  { title: "Team", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role, roleLabel, adminProjectCount, memberProjectCount } = useWorkspaceRole();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="group flex items-center gap-2.5 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand font-display text-sm text-brand-foreground shadow-elegant transition-transform group-hover:scale-105">
            T
          </div>
          <div className="min-w-0">
            <span className="block font-display text-lg leading-none tracking-tight">Taskly</span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {roleLabel} workspace
            </span>
          </div>
        </Link>
        <div className="px-2 pb-2">
          <Badge
            variant={role === "ADMIN" ? "default" : "secondary"}
            className={
              role === "ADMIN"
                ? "border-brand/20 bg-brand text-brand-foreground"
                : "bg-muted text-muted-foreground"
            }
          >
            {roleLabel}
          </Badge>
          {role !== "NONE" && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {role === "ADMIN"
                ? `Admin on ${adminProjectCount} project${adminProjectCount === 1 ? "" : "s"}.`
                : `Member on ${memberProjectCount} project${memberProjectCount === 1 ? "" : "s"}.`}
            </p>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => {
                const active = pathname === it.url || pathname.startsWith(it.url + "/");
                return (
                  <SidebarMenuItem key={it.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={it.url} className="flex items-center gap-2">
                        <it.icon className="h-4 w-4" />
                        <span>{it.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
