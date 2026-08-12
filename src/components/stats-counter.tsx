"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

function Counter({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    let start = 0;
    const step = Math.max(1, Math.floor(value / 30));
    const id = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(id);
      } else {
        setDisplay(start);
      }
    }, 20);
    return () => clearInterval(id);
  }, [value, reduceMotion]);

  return <span>{display}</span>;
}

export { Counter };
