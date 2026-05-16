import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { initials, formatDate } from "@/lib/format";
import { clearToken } from "@/api/client";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your account profile." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !user ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 sm:items-center">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                  <AvatarFallback className="text-base">{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="text-base font-semibold">{user.name}</div>
                  <div className="break-all text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-muted/20 p-3 text-sm sm:grid-cols-2">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">User ID</div>
                  <div className="break-all font-mono text-xs">{user.id}</div>
                </div>
                {user.createdAt && (
                  <div>
                    <div className="text-xs text-muted-foreground">Member since</div>
                    <div>{formatDate(user.createdAt)}</div>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  clearToken();
                  window.location.href = "/login";
                }}
              >
                <LogOut className="mr-1.5 h-4 w-4" /> Log out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
