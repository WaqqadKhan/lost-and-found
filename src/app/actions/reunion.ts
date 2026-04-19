"use server";

import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reunionCelebrationEligible } from "@/lib/reunion";

export async function markReunionConfettiShown(itemId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;

  try {
    const eligible = await reunionCelebrationEligible(itemId, session.user.id);
    if (!eligible) return;

    try {
      await prisma.reunionView.create({
        data: { itemId, userId: session.user.id },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return;
      // Avoid surfacing a hard 500 for a best-effort celebration marker (DB drift / locks).
      console.error("markReunionConfettiShown failed:", e);
    }
  } catch (e) {
    console.error("markReunionConfettiShown failed:", e);
  }
}
