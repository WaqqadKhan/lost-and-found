import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageSpinner({
  label = "Loading…",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"
          : "flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground"
      }
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={compact ? "size-5 animate-spin text-primary" : "size-8 animate-spin text-primary"}
        aria-hidden
      />
      <p>{label}</p>
    </div>
  );
}

export function TablePageSkeleton({
  titleWidth = "w-48",
  rows = 8,
}: {
  titleWidth?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className={cn("h-8", titleWidth)} />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      </div>
      <PageSpinner label="Loading…" compact />
    </div>
  );
}
