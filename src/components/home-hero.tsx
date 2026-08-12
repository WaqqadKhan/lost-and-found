"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Shield, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer, defaultTransition } from "@/lib/motion";

export function HomeHero({
  lostTarget,
  foundTarget,
}: {
  lostTarget: string;
  foundTarget: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="hero-gradient relative overflow-hidden rounded-2xl border bg-card p-8 shadow-card sm:p-12">
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={staggerContainer}
        className="relative mx-auto max-w-3xl space-y-5 text-center"
      >
        <motion.p variants={fadeUp} className="text-overline uppercase text-muted-foreground">
          Campus Lost &amp; Found · IIUI Islamabad
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-display"
        >
          Lost Something? Found Something? We&apos;ll Help You Reconnect.
        </motion.h1>
        <motion.p variants={fadeUp} className="text-balance text-sm text-muted-foreground sm:text-base">
          The university&apos;s central hub for lost and found items. Post, search, and recover — moderated by campus
          admin for your safety.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Link href={lostTarget} className={cn(buttonVariants({ variant: "destructive", size: "lg" }))}>
            Report Lost Item
          </Link>
          <Link
            href={foundTarget}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-status-found-border text-status-found-fg hover:bg-status-found",
            )}
          >
            Report Found Item
          </Link>
        </motion.div>
        <motion.div
          variants={fadeUp}
          transition={defaultTransition}
          className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-full border bg-background/60 px-4 py-2 text-xs text-muted-foreground backdrop-blur"
        >
          <Shield className="size-3.5 shrink-0 text-primary" aria-hidden />
          <span>Admin-moderated listings</span>
          <Sparkles className="size-3.5 shrink-0 text-gold-500" aria-hidden />
        </motion.div>
      </motion.div>
    </section>
  );
}
