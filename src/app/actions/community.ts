"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  return session;
}

export type ClaimFormState = { error: string | null; success: string | null };

export async function submitClaim(
  _prev: ClaimFormState,
  formData: FormData,
): Promise<ClaimFormState> {
  const session = await requireUserSession();
  const itemId = String(formData.get("itemId") || "");
  const message = String(formData.get("message") || "").trim();
  const verificationAnswer = String(formData.get("verificationAnswer") || "").trim();
  if (!itemId || !message) return { error: "Please fill in claim details.", success: null };

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return { error: "Item not found.", success: null };
  if (item.userId === session.user.id) return { error: "You cannot claim your own item.", success: null };

  const duplicate = await prisma.claim.findUnique({
    where: { itemId_claimantId: { itemId, claimantId: session.user.id } },
  });
  if (duplicate) return { error: "You have already submitted a claim.", success: null };

  const matched =
    item.verificationAnswer && verificationAnswer
      ? item.verificationAnswer.trim().toLowerCase() === verificationAnswer.trim().toLowerCase()
      : false;

  await prisma.$transaction([
    prisma.claim.create({
      data: {
        itemId,
        claimantId: session.user.id,
        message,
        verificationAnswer: verificationAnswer || null,
        verificationMatched: matched,
      },
    }),
    prisma.notification.create({
      data: {
        userId: item.userId,
        itemId: item.id,
        type: "claim",
        message: `Someone claims your item "${item.title}". Review their claim.`,
      },
    }),
  ]);

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/dashboard/my-claims");
  revalidatePath("/dashboard/notifications");
  return { error: null, success: "Claim submitted successfully." };
}

export async function decideClaim(formData: FormData) {
  const session = await requireUserSession();
  const claimId = String(formData.get("claimId") || "");
  const decision = String(formData.get("decision") || "");
  if (!claimId || (decision !== "accepted" && decision !== "rejected")) return;

  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: { item: true, claimant: true },
  });
  if (!claim || claim.item.userId !== session.user.id) return;

  const msg =
    decision === "accepted"
      ? `Your claim on "${claim.item.title}" was accepted! Contact the owner to arrange pickup.`
      : `Your claim on "${claim.item.title}" was not accepted.`;

  await prisma.$transaction([
    prisma.claim.update({ where: { id: claimId }, data: { status: decision } }),
    prisma.notification.create({
      data: {
        userId: claim.claimantId,
        itemId: claim.itemId,
        type: decision === "accepted" ? "claim_accepted" : "claim_rejected",
        message: msg,
      },
    }),
  ]);

  revalidatePath(`/items/${claim.itemId}`);
  revalidatePath("/dashboard/my-claims");
  revalidatePath("/dashboard/notifications");
}

export async function postComment(formData: FormData) {
  const session = await requireUserSession();
  const itemId = String(formData.get("itemId") || "");
  const text = String(formData.get("text") || "").trim();
  if (!itemId || !text) return;
  await prisma.comment.create({
    data: { itemId, userId: session.user.id, text },
  });
  revalidatePath(`/items/${itemId}`);
}
