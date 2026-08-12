"use client";

import { Children, isValidElement } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  staggerContainer,
  fadeUp,
  reducedFade,
  defaultTransition,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Staggers direct children (heading → filters → cards).
 * Drop in as the page root instead of a plain `<div>`.
 */
export function PageContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const items = Children.toArray(children);

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={reduceMotion ? undefined : staggerContainer}
    >
      {items.map((child, i) => {
        const key =
          isValidElement(child) && child.key != null ? String(child.key) : `page-section-${i}`;
        return (
          <motion.div
            key={key}
            variants={reduceMotion ? reducedFade : fadeUp}
            transition={reduceMotion ? { duration: 0.01 } : defaultTransition}
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function MotionSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={reduceMotion ? undefined : staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function MotionItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={reduceMotion ? reducedFade : fadeUp}
      transition={reduceMotion ? { duration: 0.01 } : defaultTransition}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function MotionGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={reduceMotion ? undefined : staggerContainer}
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
