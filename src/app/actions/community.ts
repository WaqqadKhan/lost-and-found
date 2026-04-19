"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rejectOtherPendingClaimsTx, successStoryRecipientUserId } from "@/lib/claims-flow";

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
  if (item.status === "returned") return { error: "This item is already returned.", success: null };
  if (item.status !== "approved" && item.status !== "pending") {
    return { error: "This item is not open for claims.", success: null };
  }

  const duplicate = await prisma.claim.findUnique({
    where: { itemId_claimantId: { itemId, claimantId: session.user.id } },
  });
  if (duplicate) {
    return { error: "You already have a claim on this item.", success: null };
  }

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
  if (!claim) return;
  const isPoster = claim.item.userId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isPoster && !isAdmin) return;
  if (claim.status !== "pending") return;
  if (claim.item.status === "returned") return;

  if (decision === "rejected") {
    await prisma.$transaction([
      prisma.claim.update({ where: { id: claimId }, data: { status: "rejected" } }),
      prisma.notification.create({
        data: {
          userId: claim.claimantId,
          itemId: claim.itemId,
          type: "claim_rejected",
          message: `Your claim on "${claim.item.title}" was not accepted.`,
        },
      }),
    ]);
    revalidatePath(`/items/${claim.itemId}`);
    revalidatePath("/dashboard/my-claims");
    revalidatePath("/dashboard/notifications");
    revalidatePath("/admin/items");
    return;
  }

  const storyUserId = successStoryRecipientUserId({
    itemType: claim.item.type,
    posterId: claim.item.userId,
    claimantId: claim.claimantId,
  });

  await prisma.$transaction(async (tx) => {
    await tx.claim.update({ where: { id: claimId }, data: { status: "accepted" } });
    await tx.item.update({ where: { id: claim.itemId }, data: { status: "returned" } });
    await rejectOtherPendingClaimsTx(tx, claim.itemId, claimId, {
      type: "claim_rejected",
      message: `Your claim on "${claim.item.title}" was closed because another claim was accepted.`,
    });
    await tx.successStory.upsert({
      where: { itemId_userId: { itemId: claim.itemId, userId: storyUserId } },
      update: {},
      create: { itemId: claim.itemId, userId: storyUserId },
    });
    await tx.notification.create({
      data: {
        userId: claim.claimantId,
        itemId: claim.itemId,
        type: "claim_accepted",
        message: `Your claim on "${claim.item.title}" was accepted! The item is marked returned — contact details are now visible on the listing.`,
      },
    });
    await tx.notification.create({
      data: {
        userId: claim.item.userId,
        itemId: claim.itemId,
        type: "claim_accepted",
        message: `You accepted a claim for "${claim.item.title}". The item is marked returned — contact details are now visible on the listing.`,
      },
    });
  });

  revalidatePath(`/items/${claim.itemId}`);
  revalidatePath("/dashboard/my-claims");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/my-items");
  revalidatePath("/admin/items");
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
