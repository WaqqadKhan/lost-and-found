"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Instant feedback on internal navigations: top progress bar + corner spinner.
 * Clears when the URL (pathname/search) updates.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlKey = `${pathname}?${searchParams?.toString() ?? ""}`;

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActive(false);
    // brief settle so the bar doesn't vanish mid-frame
    timerRef.current = setTimeout(() => setVisible(false), 180);
  }, []);

  const start = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
    setActive(true);
    // safety: never leave spinner forever
    timerRef.current = setTimeout(() => stop(), 12_000);
  }, [stop]);

  useEffect(() => {
    stop();
  }, [urlKey, stop]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      if (anchor.getAttribute("target") === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        const nextKey = `${url.pathname}?${url.searchParams.toString()}`;
        const currentKey = `${window.location.pathname}?${window.location.search.slice(1)}`;
        if (nextKey === currentKey) return;
        start();
      } catch {
        // ignore malformed hrefs
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-transparent"
        aria-hidden
      >
        <div
          className={cn(
            "h-full origin-left bg-primary transition-transform duration-300 ease-out",
            active ? "nav-progress-bar w-full" : "w-full scale-x-100 opacity-0",
          )}
        />
      </div>
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-full border bg-card/95 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-card backdrop-blur"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden />
        Loading…
      </div>
    </>
  );
}
