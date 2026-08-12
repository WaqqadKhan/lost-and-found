import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CANVAS, type CanvasSettings } from "@/lib/canvas";

async function readCanvasSettings(): Promise<CanvasSettings> {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (!row) return DEFAULT_CANVAS;
    return {
      canvasMode: row.canvasMode === "gradient" ? "gradient" : "solid",
      canvasColor1: row.canvasColor1,
      canvasColor2: row.canvasColor2,
      canvasColor3: row.canvasColor3,
      gradientAngle: row.gradientAngle,
    };
  } catch {
    return DEFAULT_CANVAS;
  }
}

/** Cached for layout — avoid a DB hit on every navigation. */
export const getSiteCanvasSettings = unstable_cache(readCanvasSettings, ["site-canvas-settings"], {
  revalidate: 120,
  tags: ["site-canvas"],
});
