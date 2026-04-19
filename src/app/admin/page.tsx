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
import { formatTimeAgo } from "@/lib/time";
import { UserAvatar } from "@/components/user-avatar";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [users, items, lostItems, foundItems, pendingItems] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.item.count({ where: { type: "lost" } }),
    prisma.item.count({ where: { type: "found" } }),
    prisma.item.count({ where: { status: "pending" } }),
  ]);
  const [recentItems, recentClaims, recentApproved, recentReturned] = await Promise.all([
    prisma.item.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
      take: 4,
    }),
    prisma.claim.findMany({
      orderBy: { createdAt: "desc" },
      include: { claimant: { select: { name: true } }, item: { select: { title: true } } },
      take: 3,
    }),
    prisma.item.findMany({
      where: { status: "approved" },
      orderBy: { updatedAt: "desc" },
      include: { user: { select: { name: true } } },
      take: 3,
    }),
    prisma.item.findMany({
      where: { status: "returned" },
      orderBy: { updatedAt: "desc" },
      include: { user: { select: { name: true } } },
      take: 3,
    }),
  ]);
  const activity = [
    ...recentItems.map((row) => ({
      at: row.createdAt,
      who: row.user.name,
      text: `${row.user.name} posted a ${row.type} item: ${row.title}`,
    })),
    ...recentClaims.map((row) => ({
      at: row.createdAt,
      who: row.claimant.name,
      text: `${row.claimant.name} submitted a claim on: ${row.item.title}`,
    })),
    ...recentApproved.map((row) => ({
      at: row.updatedAt,
      who: "Admin",
      text: `Admin approved: ${row.title}`,
    })),
    ...recentReturned.map((row) => ({
      at: row.updatedAt,
      who: row.user.name,
      text: `${row.user.name} marked as returned: ${row.title}`,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 10);

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

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Card>
          <CardContent className="pt-4">
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((entry, idx) => (
                  <li key={`${entry.text}-${idx}`} className="flex items-start gap-3 text-sm">
                    <UserAvatar name={entry.who} />
                    <div>
                      <p>{entry.text}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(entry.at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
