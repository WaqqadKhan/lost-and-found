import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { deleteMyItem } from "@/app/actions/items";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, TypeBadge } from "@/components/badges";
import { cn } from "@/lib/utils";
import { ResolvedWithoutClaimForm } from "@/components/resolved-without-claim-form";
import { formatTimeAgo, isWithinHours } from "@/lib/time";
import { EmptyState } from "@/components/empty-state";

export default async function MyItemsPage() {
  const session = await requireUser();
  const items = await prisma.item.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      claims: { select: { status: true } },
    },
  });

  const rows = [...items].sort((a, b) => {
    const aPending = a.claims.some((c) => c.status === "pending") ? 1 : 0;
    const bPending = b.claims.some((c) => c.status === "pending") ? 1 : 0;
    if (aPending !== bPending) return bPending - aPending;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My items</h1>
          <p className="text-sm text-muted-foreground">
            Manage the reports you have submitted.
          </p>
        </div>
        <Link href="/dashboard/add" className={cn(buttonVariants())}>
          New report
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No items yet"
          description="No items found. Be the first to report!"
          ctaLabel="Post Item"
          ctaHref="/dashboard/add"
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => {
                const when = formatTimeAgo(item.createdAt);
                const claimsCount = item.claims.length;
                const hasPendingClaims = item.claims.some((c) => c.status === "pending");
                return (
                  <TableRow
                    key={item.id}
                    className={cn(hasPendingClaims ? "bg-yellow-50/60" : "")}
                  >
                    <TableCell className="max-w-[220px] whitespace-normal font-medium">
                      <span className="inline-flex items-center gap-2">
                        <span>
                          {item.title}
                          {claimsCount ? <span className="text-muted-foreground"> ({claimsCount} claims)</span> : null}
                        </span>
                        {hasPendingClaims ? (
                          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">CLAIMS</span>
                        ) : null}
                        {isWithinHours(item.createdAt, 24) ? (
                          <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">NEW</span>
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={item.type} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{when}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/items/${item.id}`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          View
                        </Link>
                        {item.status === "approved" ? <ResolvedWithoutClaimForm itemId={item.id} /> : null}
                        <form action={deleteMyItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <Button type="submit" variant="destructive" size="sm">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
