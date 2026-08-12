"use client";

import Link from "next/link";
import { Inbox, Search, AlertTriangle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fadeUp, defaultTransition } from "@/lib/motion";

const icons = {
  inbox: Inbox,
  search: Search,
  alert: AlertTriangle,
} as const;

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  icon = "inbox",
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  icon?: keyof typeof icons;
}) {
  const reduceMotion = useReducedMotion();
  const Icon = icons[icon] ?? Inbox;

  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={fadeUp}
      transition={defaultTransition}
      className="rounded-xl border bg-card p-8 text-center shadow-card"
    >
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
        <Icon className="size-7 text-muted-foreground" />
      </div>
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className={cn(buttonVariants({ size: "sm" }), "mt-4 inline-flex")}>
          {ctaLabel}
        </Link>
      ) : null}
    </motion.div>
  );
}
