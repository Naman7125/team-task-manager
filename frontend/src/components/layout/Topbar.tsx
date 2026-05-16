import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "./UserMenu";
import { QuickCreate } from "./QuickCreate";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function Topbar() {
  const { data: user } = useCurrentUser();
  const { role, roleLabel } = useWorkspaceRole();

  return (
    <header className="sticky top-0 z-30 flex h-14 min-w-0 items-center gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur-xl sm:gap-3 sm:px-4">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />
      <span className="hidden truncate font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground min-[420px]:inline">
        Workspace
      </span>
      <Badge
        variant={role === "ADMIN" ? "default" : "secondary"}
        className={
          role === "ADMIN"
            ? "hidden border-brand/20 bg-brand text-brand-foreground sm:inline-flex"
            : "hidden sm:inline-flex"
        }
      >
        {roleLabel}
      </Badge>
      <div className="flex-1" />
      <QuickCreate />
      <UserMenu user={user} />
    </header>
  );
}
