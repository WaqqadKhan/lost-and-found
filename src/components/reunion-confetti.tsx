"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useReducedMotion } from "motion/react";
import { markReunionConfettiShown } from "@/app/actions/reunion";

export function ReunionConfetti({ itemId, enabled }: { itemId: string; enabled: boolean }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled || reduceMotion) return;
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.65 } });
    void markReunionConfettiShown(itemId);
  }, [enabled, itemId, reduceMotion]);

  return null;
}
