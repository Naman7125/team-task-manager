import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, FolderKanban, ListChecks } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";

export function QuickCreate() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { canCreateProject, role } = useWorkspaceRole();

  if (role === "MEMBER") return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="gap-1.5 rounded-lg bg-gradient-brand text-brand-foreground shadow-elegant transition-all hover:brightness-105 hover:shadow-lift"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {canCreateProject && (
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <FolderKanban className="mr-2 h-4 w-4" /> New project
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => navigate({ to: "/projects" })}>
            <ListChecks className="mr-2 h-4 w-4" /> New task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateProjectDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
