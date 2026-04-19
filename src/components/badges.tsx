import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const className =
    s === "pending"
      ? "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800"
      : s === "approved"
        ? "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800"
        : s === "returned"
          ? "bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-950 dark:text-sky-100 dark:border-sky-800"
          : "bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("capitalize", className)}>
      {status}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const t = type.toLowerCase();
  const className =
    t === "lost"
      ? "bg-red-100 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-900"
      : "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800";
  return (
    <Badge variant="outline" className={cn("capitalize", className)}>
      {type}
    </Badge>
  );
}
