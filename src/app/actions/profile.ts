"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ProfileFormState = {
  error: string | null;
  success: string | null;
};

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "You must be logged in.", success: null };
  }

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const autoApproveChecked = formData.get("autoApprove") === "on";

  if (!name) {
    return { error: "Name is required.", success: null };
  }

  const current = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!current) {
    return { error: "User not found.", success: null };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone: phone.length ? phone : null,
      ...(current.role === "admin" ? { autoApprove: autoApproveChecked } : {}),
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/");
  return { error: null, success: "Profile updated successfully." };
}
