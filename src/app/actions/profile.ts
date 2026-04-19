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

  if (!name) {
    return { error: "Name is required.", success: null };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone: phone.length ? phone : null,
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/");
  return { error: null, success: "Profile updated successfully." };
}
