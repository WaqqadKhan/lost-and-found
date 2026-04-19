import Link from "next/link";
import { Inbox } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-8 text-center">
      <Inbox className="mx-auto mb-3 size-8 text-muted-foreground" />
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className={cn(buttonVariants({ size: "sm" }), "mt-4 inline-flex")}>
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
