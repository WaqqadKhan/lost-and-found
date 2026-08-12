"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_CANVAS,
  normalizeHex,
  type CanvasMode,
} from "@/lib/canvas";

export type CanvasFormState = {
  error: string | null;
  success: string | null;
};

export async function updateCanvasSettings(
  _prev: CanvasFormState,
  formData: FormData,
): Promise<CanvasFormState> {
  await requireAdmin();

  const modeRaw = String(formData.get("canvasMode") || "solid");
  const canvasMode: CanvasMode = modeRaw === "gradient" ? "gradient" : "solid";
  const canvasColor1 = normalizeHex(String(formData.get("canvasColor1") || ""), DEFAULT_CANVAS.canvasColor1);
  const canvasColor2 = normalizeHex(String(formData.get("canvasColor2") || ""), DEFAULT_CANVAS.canvasColor2);
  const c3Raw = String(formData.get("canvasColor3") || "").trim();
  const useThird = formData.get("useThirdColor") === "on";
  const canvasColor3 =
    canvasMode === "gradient" && useThird && c3Raw
      ? normalizeHex(c3Raw, DEFAULT_CANVAS.canvasColor3!)
      : null;
  const angle = Math.min(360, Math.max(0, Number(formData.get("gradientAngle") || 145) || 145));

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      canvasMode,
      canvasColor1,
      canvasColor2,
      canvasColor3,
      gradientAngle: angle,
    },
    update: {
      canvasMode,
      canvasColor1,
      canvasColor2,
      canvasColor3,
      gradientAngle: angle,
    },
  });

  revalidateTag("site-canvas");
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/profile");
  return { error: null, success: "Canvas updated for everyone." };
}
