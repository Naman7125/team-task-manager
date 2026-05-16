import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { projectsApi } from "@/api/projects";
import { qk } from "@/lib/queryKeys";
import { initials, formatDate } from "@/lib/format";
import { adminCount } from "@/lib/permissions";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { Member, Role } from "@/types/api";

export function MemberList({
  projectId,
  members,
  canManage,
  currentUserId,
}: {
  projectId: string;
  members: Member[];
  canManage: boolean;
  currentUserId?: string;
}) {
  const qc = useQueryClient();
  const [removing, setRemoving] = useState<Member | null>(null);
  const admins = adminCount(members);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.projectMembers(projectId) });
    qc.invalidateQueries({ queryKey: qk.project(projectId) });
  };

  const roleM = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      projectsApi.updateMember(projectId, userId, { role }),
    onSuccess: () => {
      toast.success("Role updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeM = useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      toast.success("Member removed");
      invalidate();
      setRemoving(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Member</th>
              <th className="px-4 py-2 text-left font-medium">Role</th>
              <th className="px-4 py-2 text-left font-medium">Joined</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {members.map((m) => {
              const isOnlyAdmin = m.role === "ADMIN" && admins <= 1;
              return (
                <tr key={m.user.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{initials(m.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{m.user.name}</div>
                        <div className="text-xs text-muted-foreground">{m.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {canManage ? (
                      <Select
                        value={m.role}
                        onValueChange={(v) => roleM.mutate({ userId: m.user.id, role: v as Role })}
                        disabled={isOnlyAdmin && m.role === "ADMIN"}
                      >
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER" disabled={isOnlyAdmin}>
                            Member
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={m.role === "ADMIN" ? "default" : "secondary"}>{m.role}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(m.joinedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {canManage && m.user.id !== currentUserId && !isOnlyAdmin && (
                      <Button size="sm" variant="ghost" onClick={() => setRemoving(m)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="Remove this member?"
        description={removing ? `${removing.user.name} will lose access to this project.` : ""}
        confirmLabel="Remove"
        destructive
        loading={removeM.isPending}
        onConfirm={() => removing && removeM.mutate(removing.user.id)}
      />
    </>
  );
}
