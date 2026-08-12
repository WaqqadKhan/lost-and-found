import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterChip({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-accent px-3 py-1 text-sm text-accent-foreground transition-colors hover:bg-accent/80",
        className,
      )}
    >
      {label}
      <X className="size-3" aria-hidden />
      <span className="sr-only">Remove filter {label}</span>
    </Link>
  );
}

export function TagPill({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}
