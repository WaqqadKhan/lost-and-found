"use client";

import type { Variants, Transition } from "motion/react";

/** Soft ease-out — keep snappy for perceived performance */
export const motionEase = [0.22, 1, 0.36, 1] as const;

export const defaultTransition: Transition = {
  duration: 0.2,
  ease: motionEase,
};

export const snappyTransition: Transition = {
  duration: 0.16,
  ease: motionEase,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: defaultTransition,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: defaultTransition,
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02,
    },
  },
};

export const reducedFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
};

export function reducedMotionVariants(variants: Variants): Variants {
  const reduced: Variants = {};
  for (const [key, value] of Object.entries(variants)) {
    if (typeof value === "object" && value !== null) {
      reduced[key] = {
        ...value,
        transition: { duration: 0.01 },
        y: 0,
        scale: 1,
      };
    } else {
      reduced[key] = value;
    }
  }
  return reduced;
}
