"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ITEM_CATEGORIES } from "@/lib/constants";
import { rejectAllPendingClaimsTx } from "@/lib/claims-flow";

const CATEGORY_LIST: string[] = [...ITEM_CATEGORIES];

async function requireAdminId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
  return session.user.id;
}

export async function approveItem(formData: FormData) {
  await requireAdminId();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const pending = await prisma.item.findFirst({
    where: { id, status: "pending" },
  });
  if (!pending) return;

  const message = `Your item "${pending.title}" has been approved and is now visible to everyone.`;

  await prisma.$transaction([
    prisma.item.update({
      where: { id },
      data: { status: "approved" },
    }),
    prisma.notification.create({
      data: {
        userId: pending.userId,
        message,
        type: "approved",
        itemId: id,
      },
    }),
  ]);

  revalidatePath("/admin/items");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
  revalidatePath(`/items/${id}`);
}

export async function deleteItemAdmin(formData: FormData) {
  await requireAdminId();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const existing = await prisma.item.findUnique({ where: { id } });
  if (!existing) return;

  const message = `Your item "${existing.title}" has been rejected by admin.`;

  await prisma.$transaction([
    prisma.notification.create({
      data: {
        userId: existing.userId,
        message,
        type: "rejected",
        itemId: id,
      },
    }),
    prisma.item.delete({ where: { id } }),
  ]);

  revalidatePath("/admin/items");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/search");
}

export async function markItemReturnedAdmin(formData: FormData) {
  await requireAdminId();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const existing = await prisma.item.findUnique({ where: { id } });
  if (!existing || existing.status === "returned") return;

  await prisma.$transaction(async (tx) => {
    await tx.item.update({ where: { id }, data: { status: "returned" } });
    await rejectAllPendingClaimsTx(tx, id, {
      type: "claim_rejected",
      message: `Your claim on "${existing.title}" was closed because the item was marked returned by an admin.`,
    });
  });

  await prisma.notification.create({
    data: {
      userId: existing.userId,
      itemId: id,
      type: "approved",
      message: `An admin marked your item "${existing.title}" as returned.`,
    },
  });

  revalidatePath("/admin/items");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/my-items");
  revalidatePath("/dashboard/my-claims");
  revalidatePath(`/items/${id}`);
}

export async function deleteUserAdmin(formData: FormData) {
  const adminId = await requireAdminId();
  const id = String(formData.get("id") || "");
  if (!id || id === adminId) return;

  await prisma.item.deleteMany({ where: { userId: id } });
  await prisma.user.deleteMany({ where: { id } });
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export type AdminItemFormState = { error: string };

export async function updateItemAdmin(
  _prev: AdminItemFormState,
  formData: FormData,
): Promise<AdminItemFormState> {
  await requireAdminId();
  const id = String(formData.get("id") || "");
  if (!id) {
    return { error: "Missing item." };
  }

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "");
  const location = String(formData.get("location") || "").trim();
  const dateStr = String(formData.get("date") || "");
  const type = String(formData.get("type") || "");

  if (!title || !description || !location || !dateStr || !type) {
    return { error: "Please fill in all required fields." };
  }
  if (type !== "lost" && type !== "found") {
    return { error: "Invalid type." };
  }
  if (!CATEGORY_LIST.includes(category)) {
    return { error: "Invalid category." };
  }

  const exists = await prisma.item.findUnique({ where: { id } });
  if (!exists) {
    return { error: "Item not found." };
  }

  await prisma.item.update({
    where: { id },
    data: {
      title,
      description,
      category,
      location,
      date: new Date(dateStr),
      type,
    },
  });

  revalidatePath("/admin/items");
  revalidatePath(`/items/${id}`);
  revalidatePath("/");
  revalidatePath("/search");
  redirect("/admin/items");
}
