import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { approveItem, deleteItemAdmin } from "@/app/actions/admin";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, TypeBadge } from "@/components/badges";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { decideClaim } from "@/app/actions/community";
import { UserAvatar } from "@/components/user-avatar";
import { formatTimeAgo } from "@/lib/time";
import { Card, CardContent } from "@/components/ui/card";
import { AdminMarkReturnedForm } from "@/components/admin-mark-returned-form";
import { ClaimVerificationReview } from "@/components/claim-verification-review";
import { PageContent } from "@/components/motion-primitives";

export default async function AdminItemsPage() {
  await requireAdmin();

  // Select only moderation fields — skip description/images (huge) for speed
  const items = await prisma.item.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      date: true,
      verificationQuestion: true,
      user: { select: { name: true, email: true } },
      claims: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          message: true,
          status: true,
          createdAt: true,
          verificationAnswer: true,
          verificationMatched: true,
          claimant: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
    },
  });

  const itemsWithClaims = items.filter((i) => i.claims.length > 0);

  return (
    <PageContent className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Manage items</h1>
        <p className="text-sm text-muted-foreground">
          Approve pending posts or remove anything that breaks the guidelines.
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Posted by</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Claims</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const when = new Date(item.date).toLocaleDateString();
              const claimsCount = item.claims.length;
              return (
                <TableRow key={item.id}>
                  <TableCell className="max-w-[200px] whitespace-normal font-medium">
                    <Link
                      href={`/items/${item.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={item.type} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="whitespace-normal text-sm">
                    <div className="font-medium">{item.user.name}</div>
                    <div className="text-muted-foreground">{item.user.email}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{when}</TableCell>
                  <TableCell className="text-sm">
                    {claimsCount ? (
                      <a className="text-primary underline-offset-4 hover:underline" href={`#admin-claims-${item.id}`}>
                        Claims ({claimsCount})
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/items/${item.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/items/${item.id}/edit`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Edit
                      </Link>
                      {item.status === "pending" ? (
                        <form action={approveItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <Button type="submit" size="sm">
                            Approve
                          </Button>
                        </form>
                      ) : null}
                      {item.status !== "returned" ? <AdminMarkReturnedForm itemId={item.id} /> : null}
                      <ConfirmDeleteButton
                        label={item.status === "pending" ? "Reject" : "Delete"}
                        title={item.status === "pending" ? "Reject this listing?" : "Delete this listing?"}
                        description="This action cannot be undone."
                        formAction={deleteItemAdmin}
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

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Claims moderation</h2>
        <p className="text-sm text-muted-foreground">
          Accepting a claim marks the item returned, rejects other pending claims, and reveals contact details to the
          matched parties (same as the poster flow).
        </p>

        <div className="space-y-10">
          {itemsWithClaims.length === 0 ? (
            <p className="text-sm text-muted-foreground">No claims yet.</p>
          ) : null}
          {itemsWithClaims.map((item) => (
            <section key={item.id} id={`admin-claims-${item.id}`} className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.type} · <StatusBadge status={item.status} /> · {item.claims.length} claim(s)
                  </p>
                </div>
                <Link href={`/items/${item.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  Open listing
                </Link>
              </div>

              <div className="space-y-3">
                {item.claims.map((claim) => (
                  <Card
                    key={claim.id}
                    className={cn(
                      claim.status === "accepted" && "border-emerald-300 bg-emerald-50/40",
                      claim.status === "rejected" && "opacity-60",
                    )}
                  >
                    <CardContent className="space-y-2 pt-4 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <UserAvatar name={claim.claimant.name} className="size-7 text-[10px]" />
                        <p className="font-medium">{claim.claimant.name}</p>
                        <StatusBadge status={claim.status} />
                        {item.type === "found" && item.verificationQuestion ? (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs",
                              claim.verificationMatched ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800",
                            )}
                          >
                            {claim.verificationMatched ? "Verified" : "Unverified"}
                          </span>
                        ) : null}
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(claim.createdAt)}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{claim.message}</p>

                      <ClaimVerificationReview
                        itemType={item.type}
                        listingQuestion={item.verificationQuestion}
                        claimantAnswer={claim.verificationAnswer}
                        matched={claim.verificationMatched}
                      />

                      {claim.status === "pending" && item.status !== "returned" ? (
                        <div className="flex flex-wrap gap-2">
                          <form action={decideClaim}>
                            <input type="hidden" name="claimId" value={claim.id} />
                            <input type="hidden" name="decision" value="accepted" />
                            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-600/90">
                              Accept
                            </Button>
                          </form>
                          <form action={decideClaim}>
                            <input type="hidden" name="claimId" value={claim.id} />
                            <input type="hidden" name="decision" value="rejected" />
                            <Button type="submit" size="sm" variant="destructive">
                              Reject
                            </Button>
                          </form>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageContent>
  );
}
