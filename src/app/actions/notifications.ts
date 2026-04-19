"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user.id;
}

export async function markNotificationRead(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
  revalidatePath("/dashboard/notifications");
  revalidatePath("/");
}

export async function markAllNotificationsRead() {
  const userId = await requireUserId();
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  revalidatePath("/dashboard/notifications");
  revalidatePath("/");
}
