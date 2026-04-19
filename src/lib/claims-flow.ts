import type { Prisma, PrismaClient } from "@prisma/client";

type Db = PrismaClient | Prisma.TransactionClient;

export async function rejectOtherPendingClaimsTx(
  tx: Db,
  itemId: string,
  exceptClaimId: string,
  notification: { type: string; message: string },
) {
  const others = await tx.claim.findMany({
    where: { itemId, status: "pending", id: { not: exceptClaimId } },
    select: { id: true, claimantId: true },
  });
  if (!others.length) return;

  await tx.claim.updateMany({
    where: { id: { in: others.map((c) => c.id) } },
    data: { status: "rejected" },
  });

  await tx.notification.createMany({
    data: others.map((c) => ({
      userId: c.claimantId,
      itemId,
      type: notification.type,
      message: notification.message,
    })),
  });
}

export async function rejectAllPendingClaimsTx(
  tx: Db,
  itemId: string,
  notification: { type: string; message: string },
) {
  const pending = await tx.claim.findMany({
    where: { itemId, status: "pending" },
    select: { id: true, claimantId: true },
  });
  if (!pending.length) return;

  await tx.claim.updateMany({
    where: { id: { in: pending.map((c) => c.id) } },
    data: { status: "rejected" },
  });

  await tx.notification.createMany({
    data: pending.map((c) => ({
      userId: c.claimantId,
      itemId,
      type: notification.type,
      message: notification.message,
    })),
  });
}

export function successStoryRecipientUserId(args: { itemType: string; posterId: string; claimantId: string }) {
  return args.itemType === "found" ? args.claimantId : args.posterId;
}
