import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  loading,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "default" | "warning" | "info" | "success";
  loading?: boolean;
}) {
  const isWarning = accent === "warning";
  const isInfo = accent === "info";

  const borderAccent = isWarning
    ? "border-l-4 border-l-destructive"
    : isInfo
      ? "border-l-4 border-l-brand"
      : "";

  const chipClass = isWarning
    ? "bg-destructive/10 border-destructive/20 text-destructive"
    : isInfo
      ? "bg-brand-soft border-brand/20 text-brand"
      : "bg-muted border-border/60 text-muted-foreground";

  const valueClass = isWarning ? "text-destructive" : "text-foreground";

  return (
    <div
      className={cn(
        "h-full rounded-xl border border-border/70 bg-card p-5 shadow-elegant hover-lift animate-fade-up",
        borderAccent,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <div className={cn("rounded-md border p-1.5", chipClass)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-12" />
      ) : (
        <div className={cn("font-display text-3xl leading-none", valueClass)}>{value}</div>
      )}
    </div>
  );
}
