import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [users, items, lostItems, foundItems, pendingItems] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.item.count({ where: { type: "lost" } }),
    prisma.item.count({ where: { type: "found" } }),
    prisma.item.count({ where: { status: "pending" } }),
  ]);

  const pendingHighlight =
    pendingItems > 0
      ? "border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 shadow-sm dark:border-orange-800 dark:from-orange-950/50 dark:to-red-950/40"
      : "";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor platform activity and moderate new submissions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/items" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Manage items
          </Link>
          <Link href="/admin/users" className={cn(buttonVariants({ size: "sm" }))}>
            Manage users
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total users</CardTitle>
            <CardDescription>Registered accounts</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{users}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total items</CardTitle>
            <CardDescription>All submissions</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{items}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lost items</CardTitle>
            <CardDescription>Reports marked as lost</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{lostItems}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Found items</CardTitle>
            <CardDescription>Reports marked as found</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{foundItems}</CardContent>
        </Card>
        <Card className={cn(pendingHighlight)}>
          <CardHeader>
            <CardTitle className="text-base">Pending review</CardTitle>
            <CardDescription>Waiting for approval</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-orange-900 dark:text-orange-100">
            {pendingItems}
          </CardContent>
          {pendingItems > 0 ? (
            <CardFooter className="pt-0">
              <Link
                href="/admin/items"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-orange-600 text-white hover:bg-orange-700",
                )}
              >
                Review now
              </Link>
            </CardFooter>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
