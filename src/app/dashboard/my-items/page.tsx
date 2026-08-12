import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { deleteMyItem } from "@/app/actions/items";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, TypeBadge, NewBadge, ItemStatusChip } from "@/components/badges";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { cn } from "@/lib/utils";
import { ResolvedWithoutClaimForm } from "@/components/resolved-without-claim-form";
import { formatTimeAgo, isWithinHours } from "@/lib/time";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContent } from "@/components/motion-primitives";

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
    <PageContent className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">My items</h1>
          <p className="text-sm text-muted-foreground">Manage the reports you have submitted.</p>
        </div>
        <Link href="/dashboard/add" className={cn(buttonVariants())}>
          New report
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No items yet"
          description="Report a lost or found item to get started."
          ctaLabel="Post Item"
          ctaHref="/dashboard/add"
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {rows.map((item) => {
              const when = formatTimeAgo(item.createdAt);
              const hasPendingClaims = item.claims.some((c) => c.status === "pending");
              return (
                <Card key={item.id} className={cn(hasPendingClaims && "border-status-pending-border")}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      {hasPendingClaims ? <ItemStatusChip label="Claims" variant="pending" /> : null}
                      {isWithinHours(item.createdAt, 24) ? <NewBadge /> : null}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <TypeBadge type={item.type} />
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-muted-foreground">{when}</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/items/${item.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                        View
                      </Link>
                      {item.status === "approved" ? <ResolvedWithoutClaimForm itemId={item.id} /> : null}
                      <ConfirmDeleteButton
                        label="Delete"
                        title="Delete this listing?"
                        description="This will permanently remove your report."
                        formAction={deleteMyItem}
                        hiddenFields={{ id: item.id }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="hidden rounded-xl border bg-card md:block">
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
                    <TableRow key={item.id} className={cn(hasPendingClaims && "bg-status-pending/30")}>
                      <TableCell className="max-w-[220px] whitespace-normal font-medium">
                        <span className="inline-flex flex-wrap items-center gap-2">
                          <span>
                            {item.title}
                            {claimsCount ? (
                              <span className="text-muted-foreground"> ({claimsCount} claims)</span>
                            ) : null}
                          </span>
                          {hasPendingClaims ? <ItemStatusChip label="Claims" variant="pending" /> : null}
                          {isWithinHours(item.createdAt, 24) ? <NewBadge /> : null}
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
                          <ConfirmDeleteButton
                            label="Delete"
                            title="Delete this listing?"
                            description="This will permanently remove your report."
                            formAction={deleteMyItem}
                            hiddenFields={{ id: item.id }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </PageContent>
  );
}
