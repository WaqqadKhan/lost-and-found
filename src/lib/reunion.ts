import { prisma } from "@/lib/prisma";

/** Poster or accepted claimant on a returned item — used for reunion confetti eligibility. */
export async function reunionCelebrationEligible(itemId: string, userId: string) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, status: true, userId: true },
    });
    if (!item || item.status !== "returned") return false;
    if (item.userId === userId) return true;
    const accepted = await prisma.claim.findFirst({
      where: { itemId, status: "accepted", claimantId: userId },
      select: { id: true },
    });
    return Boolean(accepted);
  } catch {
    return false;
  }
}

export async function shouldCelebrateReunionConfetti(itemId: string, userId: string | null | undefined) {
  if (!userId) return false;
  try {
    const ok = await reunionCelebrationEligible(itemId, userId);
    if (!ok) return false;
    const seen = await prisma.reunionView.findUnique({
      where: { itemId_userId: { itemId, userId } },
      select: { id: true },
    });
    return !seen;
  } catch {
    return false;
  }
}
