"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ITEM_CATEGORIES } from "@/lib/constants";
import { rejectAllPendingClaimsTx } from "@/lib/claims-flow";

const CATEGORY_LIST: string[] = [...ITEM_CATEGORIES];

export type ItemFormState = { error: string };

async function requireSessionUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user.id;
}

function safeUploadName(original: string) {
  const base = path.basename(original).replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${Date.now()}-${base || "image"}`;
}

export async function createItem(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const userId = await requireSessionUserId();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "");
  const location = String(formData.get("location") || "").trim();
  const dateStr = String(formData.get("date") || "");
  const type = String(formData.get("type") || "");
  const verificationQuestionRaw = String(formData.get("verificationQuestion") || "").trim();
  const verificationAnswerRaw = String(formData.get("verificationAnswer") || "").trim();

  if (!title || !description || !location || !dateStr || !type) {
    return { error: "Please fill in all required fields." };
  }
  if (type !== "lost" && type !== "found") {
    return { error: "Invalid item type." };
  }
  if (!CATEGORY_LIST.includes(category)) {
    return { error: "Please choose a category." };
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const files = formData.getAll("images");
  const uploaded: string[] = [];
  for (const file of files.slice(0, 3)) {
    if (file && typeof file === "object" && "arrayBuffer" in file) {
      const f = file as File;
      if (f.size > 0) {
        const buf = Buffer.from(await f.arrayBuffer());
        const name = safeUploadName(f.name || "upload");
        const full = path.join(uploadsDir, name);
        await writeFile(full, buf);
        uploaded.push(`/uploads/${name}`);
      }
    }
  }
  const imagePath = uploaded[0] || null;
  const autoApproveEnabled = await prisma.user.findFirst({
    where: { role: "admin", autoApprove: true },
    select: { id: true },
  });

  const verificationQuestion = type === "found" ? verificationQuestionRaw || null : null;
  const verificationAnswer = type === "found" ? verificationAnswerRaw || null : null;

  await prisma.item.create({
    data: {
      title,
      description,
      category,
      location,
      date: new Date(dateStr),
      type,
      status: autoApproveEnabled ? "approved" : "pending",
      image: imagePath,
      images: uploaded.length ? JSON.stringify(uploaded) : null,
      verificationQuestion,
      verificationAnswer,
      userId,
    },
  });

  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  redirect("/dashboard/my-items");
}

export async function deleteMyItem(formData: FormData) {
  const userId = await requireSessionUserId();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const item = await prisma.item.findFirst({
    where: { id, userId },
  });
  if (!item) return;

  await prisma.item.delete({ where: { id } });
  revalidatePath("/dashboard/my-items");
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/admin/items");
}

export async function markItemResolvedWithoutClaim(formData: FormData) {
  const userId = await requireSessionUserId();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const item = await prisma.item.findFirst({
    where: { id, userId, status: "approved" },
  });
  if (!item) return;

  await prisma.$transaction(async (tx) => {
    await tx.item.update({ where: { id }, data: { status: "returned" } });
    await rejectAllPendingClaimsTx(tx, id, {
      type: "claim_rejected",
      message: `Your claim on "${item.title}" was closed because the poster resolved the item without a claim.`,
    });
    await tx.successStory.upsert({
      where: { itemId_userId: { itemId: id, userId } },
      update: {},
      create: { itemId: id, userId },
    });
  });
  revalidatePath("/dashboard/my-items");
  revalidatePath("/dashboard");
  revalidatePath("/stories");
  revalidatePath("/");
  revalidatePath(`/items/${id}`);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/my-claims");
}

export type SuccessStoryFormState = { error: string | null; success: string | null };

export async function saveSuccessStory(
  _prev: SuccessStoryFormState,
  formData: FormData,
): Promise<SuccessStoryFormState> {
  const userId = await requireSessionUserId();
  const itemId = String(formData.get("itemId") || "");
  const message = String(formData.get("message") || "").trim();
  if (!itemId) return { error: "Missing item.", success: null };

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return { error: "Item not found.", success: null };
  if (item.status !== "returned") {
    return { error: "You can only share a story after the item is returned.", success: null };
  }

  const accepted = await prisma.claim.findFirst({
    where: { itemId, status: "accepted", claimantId: userId },
    select: { id: true },
  });
  const isPoster = item.userId === userId;
  const isRightParty = item.type === "lost" ? isPoster : Boolean(accepted);

  if (!isRightParty) {
    return { error: "You are not eligible to write the reunion story for this listing.", success: null };
  }

  await prisma.successStory.upsert({
    where: { itemId_userId: { itemId, userId } },
    update: { message: message || null },
    create: { itemId, userId, message: message || null },
  });
  revalidatePath("/stories");
  revalidatePath("/");
  revalidatePath("/dashboard/my-items");
  revalidatePath(`/items/${itemId}`);
  return { error: null, success: "Story saved." };
}

