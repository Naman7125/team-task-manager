import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  FolderKanban,
  ListChecks,
  UserCheck,
  AlertCircle,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { dashboardApi } from "@/api/dashboard";
import { qk } from "@/lib/queryKeys";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusChart } from "@/components/dashboard/StatusChart";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge } from "@/components/tasks/Badges";
import { formatRelative, formatDate, isOverdue } from "@/lib/format";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const sectionCard =
  "rounded-2xl border border-border/70 bg-card p-4 shadow-elegant animate-fade-up sm:p-6";
const sectionHeading = "font-display text-xl text-foreground tracking-tight sm:text-2xl";
const eyebrow = "font-mono text-[10px] uppercase tracking-[0.24em] text-brand";

function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: qk.dashboard, queryFn: dashboardApi.get });
  const { role, roleLabel, adminProjectCount, memberProjectCount } = useWorkspaceRole();

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Editorial header strip */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-elegant animate-fade-up">
        <div className="flex flex-col items-start justify-between gap-5 px-4 py-5 sm:flex-row sm:items-center sm:px-6 md:px-8">
          <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-brand-foreground shadow-elegant sm:h-12 sm:w-12">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className={eyebrow}>
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1 className="mt-0.5 font-display text-3xl leading-none tracking-tight text-foreground md:text-4xl">
                Dashboard<span className="text-brand">.</span>
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant={role === "ADMIN" ? "default" : "secondary"}
                  className={
                    role === "ADMIN" ? "bg-brand text-brand-foreground" : "text-muted-foreground"
                  }
                >
                  {roleLabel}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {role === "ADMIN"
                    ? `You can manage projects, members, and tasks across ${adminProjectCount} admin project${adminProjectCount === 1 ? "" : "s"}.`
                    : role === "MEMBER"
                      ? `You can view project work and update only assigned task status across ${memberProjectCount} member project${memberProjectCount === 1 ? "" : "s"}.`
                      : "Create your first project to become its admin."}
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/tasks"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2 text-[11px] font-mono uppercase tracking-[0.2em] text-background transition-all hover:shadow-lift sm:w-auto"
          >
            Today's focus
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 lg:grid-cols-5">
        <Link to="/projects">
          <KpiCard
            label="Projects"
            value={data?.totals.projects ?? 0}
            icon={FolderKanban}
            loading={isLoading}
          />
        </Link>
        <Link to="/tasks">
          <KpiCard
            label="Tasks"
            value={data?.totals.tasks ?? 0}
            icon={ListChecks}
            loading={isLoading}
          />
        </Link>
        <Link to="/tasks">
          <KpiCard
            label="Assigned to me"
            value={data?.totals.assignedToMe ?? 0}
            icon={UserCheck}
            accent="info"
            loading={isLoading}
          />
        </Link>
        <Link to="/tasks" search={{ overdue: true }}>
          <KpiCard
            label="Overdue"
            value={data?.totals.overdue ?? 0}
            icon={AlertCircle}
            accent="warning"
            loading={isLoading}
          />
        </Link>
        <Link to="/tasks">
          <KpiCard
            label="Due soon"
            value={data?.totals.dueSoon ?? 0}
            icon={Clock}
            accent="info"
            loading={isLoading}
          />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className={sectionCard}>
            <div className="mb-6 flex flex-col items-start justify-between gap-3 min-[420px]:flex-row min-[420px]:items-end">
              <div>
                <p className={eyebrow}>Activity</p>
                <h3 className={`${sectionHeading} mt-1`}>By status</h3>
              </div>
              <span className="rounded-full border border-border/60 bg-muted px-3 py-1 text-[11px] italic text-muted-foreground">
                Last 30 days
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <StatusChart data={data?.statusBreakdown ?? { TODO: 0, IN_PROGRESS: 0, DONE: 0 }} />
            )}
          </div>

          <div className={sectionCard}>
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className={eyebrow}>Recent</p>
                <h3 className={`${sectionHeading} mt-1`}>What just moved</h3>
              </div>
              <Link
                to="/tasks"
                className="group inline-flex items-center gap-1 text-xs font-medium text-brand"
              >
                View all{" "}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : !data?.recentTasks?.length ? (
              <EmptyState title="Nothing yet" message="Recent task activity will show up here." />
            ) : (
              <ul className="divide-y divide-border/60">
                {data.recentTasks.slice(0, 6).map((t) => {
                  const overdueRow = isOverdue(t.dueDate, t.status);
                  return (
                    <li
                      key={t.id}
                      className="group flex flex-col items-start justify-between gap-3 rounded-lg px-2 py-3.5 transition-colors hover:bg-accent/40 sm:-mx-2 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ring-4 ${
                            t.status === "DONE"
                              ? "bg-success ring-success/15"
                              : t.status === "IN_PROGRESS"
                                ? "bg-brand ring-brand/15"
                                : "bg-muted-foreground/40 ring-muted-foreground/10"
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {t.title}
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            {t.project?.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={t.priority} />
                        <StatusBadge status={t.status} />
                        <span
                          className={`text-xs italic ${overdueRow ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {formatRelative(t.updatedAt)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="relative overflow-hidden rounded-2xl bg-foreground p-4 text-background shadow-lift animate-fade-up sm:p-6">
            <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-gradient-brand opacity-30 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-brand" />
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand">
                  Critical
                </p>
              </div>
              <h3 className="font-display text-2xl tracking-tight text-balance">
                Needs your <em className="italic font-normal text-brand">attention</em>.
              </h3>

              <div className="mt-6">
                {isLoading ? (
                  <Skeleton className="h-24 w-full bg-white/10" />
                ) : !data?.overdueTasks?.length ? (
                  <p className="text-sm italic text-background/60">
                    All clear. Nothing overdue — savor it.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {data.overdueTasks.slice(0, 4).map((t) => (
                      <li key={t.id} className="border-l-2 border-brand/60 pl-4 py-0.5">
                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-background/50 mb-1">
                          {t.project?.name ?? "Project"}
                        </div>
                        <div className="text-sm font-medium leading-snug">{t.title}</div>
                        <div className="mt-1 text-[11px] italic text-brand">
                          Due {formatDate(t.dueDate)}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Link
                to="/tasks"
                search={{ overdue: true }}
                className="mt-8 group inline-flex w-full items-center justify-center gap-2 rounded-lg border border-background/15 bg-background/5 py-2.5 text-[11px] font-mono uppercase tracking-[0.2em] transition-all hover:bg-background/10 hover:border-background/25"
              >
                View all overdue
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          <div className={sectionCard}>
            <p className={eyebrow}>Pulse</p>
            <h3 className={`${sectionHeading} mt-1 mb-4`}>Team rhythm</h3>
            {isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your team has{" "}
                <span className="font-display italic text-brand text-base">
                  {data?.totals.tasks ?? 0}
                </span>{" "}
                tasks in flight across{" "}
                <span className="font-display italic text-brand text-base">
                  {data?.totals.projects ?? 0}
                </span>{" "}
                projects. Stay focused on what matters today.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
