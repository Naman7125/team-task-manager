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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
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
