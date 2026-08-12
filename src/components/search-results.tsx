"use client";

import { motion, useReducedMotion } from "motion/react";
import { fadeUp, reducedFade, defaultTransition } from "@/lib/motion";

/** Enter-only re-animation when search filters/results change. */
export function SearchResults({
  resultsKey,
  children,
}: {
  resultsKey: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={resultsKey}
      initial="hidden"
      animate="visible"
      variants={reduceMotion ? reducedFade : fadeUp}
      transition={reduceMotion ? { duration: 0.01 } : defaultTransition}
    >
      {children}
    </motion.div>
  );
}
