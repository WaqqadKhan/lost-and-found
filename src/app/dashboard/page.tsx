import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireUser();
  const userId = session.user.id;
  const isAdmin = session.user.role === "admin";

  const [pending, approved, returned] = await Promise.all([
    prisma.item.count({
      where: isAdmin ? { status: "pending" } : { userId, status: "pending" },
    }),
    prisma.item.count({
      where: isAdmin ? { status: "approved" } : { userId, status: "approved" },
    }),
    prisma.item.count({
      where: isAdmin ? { status: "returned" } : { userId, status: "returned" },
    }),
  ]);
  const [itemsPosted, itemsRecovered, activeClaims] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, status: "returned" } }),
    prisma.claim.count({ where: { claimantId: userId, status: "pending" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, <span className="font-medium text-foreground">{session.user.name}</span>
          . Choose an action below or review your stats.
        </p>
      </div>

      {isAdmin && pending > 0 ? (
        <div
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-50 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <p className="font-medium">
            You have {pending} item{pending === 1 ? "" : "s"} pending review.
          </p>
          <Link
            href="/admin/items"
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "shrink-0 bg-red-600 hover:bg-red-700")}
          >
            Review now
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending</CardTitle>
            <CardDescription>
              {isAdmin ? "All users — awaiting admin review" : "Awaiting admin review"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{pending}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Approved</CardTitle>
            <CardDescription>
              {isAdmin ? "All users — visible to everyone" : "Visible to everyone"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{approved}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Returned</CardTitle>
            <CardDescription>
              {isAdmin ? "All users — marked as reunited" : "Marked as reunited"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{returned}</CardContent>
        </Card>
      </div>

      {!isAdmin ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Items posted</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{itemsPosted}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Items recovered</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{itemsRecovered}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active claims</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{activeClaims}</CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Link
          href="/dashboard/add?type=lost"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "h-auto min-h-28 flex-col items-start justify-center gap-1 whitespace-normal px-4 py-4 text-left",
          )}
        >
          <span className="text-base font-semibold">Report lost item</span>
          <span className="text-xs font-normal text-muted-foreground">
            Share what you lost so others can help find it.
          </span>
        </Link>
        <Link
          href="/dashboard/add?type=found"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "h-auto min-h-28 flex-col items-start justify-center gap-1 whitespace-normal px-4 py-4 text-left",
          )}
        >
          <span className="text-base font-semibold">Report found item</span>
          <span className="text-xs font-normal text-muted-foreground">
            Log something you found on campus.
          </span>
        </Link>
        <Link
          href="/dashboard/my-items"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto min-h-28 flex-col items-start justify-center gap-1 whitespace-normal px-4 py-4 text-left",
          )}
        >
          <span className="text-base font-semibold">My items</span>
          <span className="text-xs font-normal text-muted-foreground">
            View, update status, or remove your posts.
          </span>
        </Link>
        <Link
          href="/dashboard/profile"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto min-h-28 flex-col items-start justify-center gap-1 whitespace-normal px-4 py-4 text-left",
          )}
        >
          <span className="text-base font-semibold">Profile</span>
          <span className="text-xs font-normal text-muted-foreground">
            Update your name and phone for contact listings.
          </span>
        </Link>
        <Link
          href="/dashboard/my-claims"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto min-h-28 flex-col items-start justify-center gap-1 whitespace-normal px-4 py-4 text-left",
          )}
        >
          <span className="text-base font-semibold">My Claims</span>
          <span className="text-xs font-normal text-muted-foreground">
            Track claim requests and accepted contacts.
          </span>
        </Link>
      </div>
    </div>
  );
}
