import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "border-status-pending-border bg-status-pending text-status-pending-fg",
  approved: "border-status-approved-border bg-status-approved text-status-approved-fg",
  returned: "border-status-returned-border bg-status-returned text-status-returned-fg",
  claimed: "border-status-claimed-border bg-status-claimed text-status-claimed-fg",
  rejected: "border-destructive/30 bg-destructive/10 text-destructive",
  expired: "border-status-expired-border bg-status-expired text-status-expired-fg",
};

const typeStyles: Record<string, string> = {
  lost: "border-status-lost-border bg-status-lost text-status-lost-fg",
  found: "border-status-found-border bg-status-found text-status-found-fg",
};

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  return (
    <Badge variant="outline" className={cn("capitalize", statusStyles[s] ?? "bg-muted text-muted-foreground")}>
      {status}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const t = type.toLowerCase();
  return (
    <Badge variant="outline" className={cn("capitalize", typeStyles[t] ?? "bg-muted text-muted-foreground")}>
      {type}
    </Badge>
  );
}

export function ClaimStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const label = s === "accepted" ? "Accepted" : s === "rejected" ? "Rejected" : "Pending";
  return (
    <Badge variant="outline" className={cn("capitalize", statusStyles[s === "accepted" ? "claimed" : s] ?? statusStyles.pending)}>
      {label}
    </Badge>
  );
}

export function NewBadge() {
  return (
    <Badge className="border-0 bg-status-new text-status-new-fg uppercase tracking-wide">New</Badge>
  );
}

export function ExpiredBadge() {
  return (
    <Badge variant="outline" className={statusStyles.expired}>
      Stale
    </Badge>
  );
}

export function ItemTypeChip({ type, className }: { type: string; className?: string }) {
  const t = type.toLowerCase();
  const isLost = t === "lost";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize",
        isLost ? typeStyles.lost : typeStyles.found,
        className,
      )}
    >
      {type}
    </span>
  );
}

export function ItemStatusChip({
  label,
  variant,
  className,
}: {
  label: string;
  variant: keyof typeof statusStyles | "new";
  className?: string;
}) {
  const style =
    variant === "new"
      ? "border-0 bg-status-new text-status-new-fg"
      : statusStyles[variant] ?? "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold", style, className)}>
      {label}
    </span>
  );
}
