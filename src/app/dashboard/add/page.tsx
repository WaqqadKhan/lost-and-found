import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AddItemForm } from "@/components/add-item-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AddItemPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const session = await requireUser();
  const defaultType = searchParams.type === "found" ? "found" : "lost";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true },
  });

  const hasPhone = Boolean(user?.phone && user.phone.trim().length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New report</h1>
        <p className="text-sm text-muted-foreground">
          Submissions start as pending until an admin approves them.
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50/80 p-4 text-sm text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-50">
        <p className="font-medium">Contact visibility</p>
        <p className="mt-1 text-blue-900/90 dark:text-blue-100/90">
          Your contact info (email and phone from your profile) will be shown to others so they can
          reach you about this listing.
        </p>
      </div>

      {!hasPhone ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50">
          <p className="font-medium">No phone number on your profile</p>
          <p className="mt-1">
            You haven&apos;t added a phone number. Add one in your{" "}
            <Link className="font-semibold underline underline-offset-2" href="/dashboard/profile">
              profile
            </Link>{" "}
            so people can contact you.
          </p>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Item details</CardTitle>
          <CardDescription>
            Add clear photos and specifics to improve the chances of a match.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddItemForm defaultType={defaultType} />
        </CardContent>
      </Card>
    </div>
  );
}
