import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ClaimStatusBadge } from "@/components/badges";
import { formatTimeAgo } from "@/lib/time";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

export default async function MyClaimsPage() {
  const session = await requireUser();
  const claims = await prisma.claim.findMany({
    where: { claimantId: session.user.id },
    include: {
      item: { include: { user: { select: { name: true, email: true, phone: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">My Claims</h1>
          <p className="text-sm text-muted-foreground">Track claim requests you submitted.</p>
        </div>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Back to dashboard
        </Link>
      </div>
      {claims.length === 0 ? (
        <EmptyState
          title="No claims yet"
          description="You haven't submitted any claims yet."
          ctaLabel="Browse items"
          ctaHref="/search"
        />
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id} className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">{claim.item.title}</CardTitle>
                <CardDescription>{formatTimeAgo(claim.createdAt)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <ClaimStatusBadge status={claim.status} />
                <p>{claim.message}</p>
                {claim.status === "accepted" ? (
                  <div className="rounded-md border border-status-claimed-border bg-status-claimed/40 p-3 text-xs text-status-claimed-fg">
                    <p className="font-medium">Owner contact:</p>
                    <p>{claim.item.user.name}</p>
                    <p>{claim.item.user.email}</p>
                    <p>{claim.item.user.phone || "No phone provided"}</p>
                  </div>
                ) : null}
                <Link href={`/items/${claim.itemId}`} className="text-primary underline-offset-4 hover:underline">
                  View item
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
