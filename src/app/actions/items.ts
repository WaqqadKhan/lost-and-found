"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ITEM_CATEGORIES } from "@/lib/constants";

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
  const verificationQuestion = String(formData.get("verificationQuestion") || "").trim();
  const verificationAnswer = String(formData.get("verificationAnswer") || "").trim();

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
      verificationQuestion: verificationQuestion || null,
      verificationAnswer: verificationAnswer || null,
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

export async function markItemReturned(formData: FormData) {
  const userId = await requireSessionUserId();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const item = await prisma.item.findFirst({
    where: { id, userId, status: "approved" },
  });
  if (!item) return;

  await prisma.item.update({
    where: { id },
    data: { status: "returned" },
  });
  await prisma.successStory.upsert({
    where: { itemId_userId: { itemId: id, userId } },
    update: {},
    create: { itemId: id, userId },
  });
  revalidatePath("/dashboard/my-items");
  revalidatePath("/dashboard");
  revalidatePath("/stories");
  revalidatePath("/");
  revalidatePath(`/items/${id}`);
}

export async function saveSuccessStory(formData: FormData) {
  const userId = await requireSessionUserId();
  const itemId = String(formData.get("itemId") || "");
  const message = String(formData.get("message") || "").trim();
  if (!itemId) return;
  await prisma.successStory.upsert({
    where: { itemId_userId: { itemId, userId } },
    update: { message: message || null },
    create: { itemId, userId, message: message || null },
  });
  revalidatePath("/stories");
  revalidatePath("/");
  revalidatePath("/dashboard/my-items");
}

export async function markItemReturnedWithStory(
  _prev: { error: string | null; success: string | null },
  formData: FormData,
) {
  const userId = await requireSessionUserId();
  const id = String(formData.get("id") || "");
  const message = String(formData.get("story") || "").trim();
  if (!id) return { error: "Invalid item.", success: null };
  const item = await prisma.item.findFirst({
    where: { id, userId, status: "approved" },
  });
  if (!item) return { error: "Item not eligible.", success: null };
  await prisma.$transaction([
    prisma.item.update({ where: { id }, data: { status: "returned" } }),
    prisma.successStory.upsert({
      where: { itemId_userId: { itemId: id, userId } },
      update: { message: message || null },
      create: { itemId: id, userId, message: message || null },
    }),
  ]);
  revalidatePath("/dashboard/my-items");
  revalidatePath("/stories");
  revalidatePath("/");
  return { error: null, success: "Returned marked and story saved." };
}
