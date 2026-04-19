import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ArrowDown, Mail, Phone, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { findPossibleMatches } from "@/lib/matching";
import { formatTimeAgo } from "@/lib/time";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge, TypeBadge } from "@/components/badges";
import { ItemCard } from "@/components/item-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClaimForm, CopyLinkButton, ItemImageGallery } from "@/components/item-interactions";
import { decideClaim, postComment } from "@/app/actions/community";
import { UserAvatar } from "@/components/user-avatar";
import { approveItem } from "@/app/actions/admin";
import { shouldCelebrateReunionConfetti } from "@/lib/reunion";
import { ReunionConfetti } from "@/components/reunion-confetti";
import { SuccessStoryPromptDialog } from "@/components/success-story-prompt-dialog";
import { ClaimVerificationReview } from "@/components/claim-verification-review";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      claims: {
        include: { claimant: { select: { id: true, name: true, email: true, phone: true } } },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!item) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id;
  const isOwner = viewerId === item.userId;
  const isAdmin = session?.user?.role === "admin";
  const isLoggedIn = Boolean(viewerId);
  const canView = item.status === "approved" || item.status === "returned" || isOwner || isAdmin;

  if (!canView) {
    notFound();
  }

  const acceptedClaimForViewer = viewerId
    ? item.claims.find((c) => c.status === "accepted" && c.claimantId === viewerId)
    : undefined;
  const isAcceptedClaimant = Boolean(acceptedClaimForViewer);
  const acceptedClaimGlobal = item.claims.find((c) => c.status === "accepted") || null;

  const showReunionContacts =
    item.status === "returned" &&
    Boolean(acceptedClaimGlobal) &&
    (isOwner || isAcceptedClaimant);

  const showAdminContacts = item.status === "returned" && isAdmin;
  const showContacts = showReunionContacts || showAdminContacts;

  const myClaim = viewerId ? item.claims.find((c) => c.claimantId === viewerId) : undefined;
  const canSubmitClaim =
    isLoggedIn &&
    !isOwner &&
    (item.status === "approved" || item.status === "pending") &&
    !myClaim;

  const pendingClaimsCount = item.claims.filter((c) => c.status === "pending").length;
  const canModerateClaims = (isOwner || isAdmin) && item.status !== "returned";
  const showClaimsSection = item.claims.length > 0 && canModerateClaims;

  const storyUserId = item.type === "found" ? acceptedClaimGlobal?.claimantId : item.userId;
  const myStory =
    viewerId && storyUserId === viewerId
      ? await prisma.successStory.findUnique({
          where: { itemId_userId: { itemId: item.id, userId: viewerId } },
          select: { message: true },
        })
      : null;
  const promptStory = Boolean(viewerId && storyUserId === viewerId && item.status === "returned" && !myStory?.message);

  const celebrate = await shouldCelebrateReunionConfetti(item.id, viewerId ?? null);

  const matches = await findPossibleMatches(
    item.id,
    item.title,
    item.category,
    item.location,
    item.type,
  );

  const postedAgo = formatTimeAgo(item.createdAt);
  const itemDateLabel = new Date(item.date).toLocaleDateString();
  const stale = Date.now() - new Date(item.createdAt).getTime() > 30 * 24 * 60 * 60 * 1000;
  let imageList: string[] = [];
  if (item.images) {
    try {
      imageList = JSON.parse(item.images) as string[];
    } catch {
      imageList = [];
    }
  }
  if (!imageList.length && item.image) imageList = [item.image];

  return (
    <div className="space-y-10">
      <ReunionConfetti itemId={item.id} enabled={celebrate} />
      <SuccessStoryPromptDialog itemId={item.id} defaultOpen={promptStory} />

      <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        Posted {postedAgo}
      </div>
      {stale ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          This item was posted over a month ago and may no longer be available.
        </div>
      ) : null}

      {isOwner && pendingClaimsCount > 0 ? (
        <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 text-sm text-yellow-950">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{pendingClaimsCount} new claim(s) waiting for your review</p>
              <p className="text-xs text-yellow-900/80">Review the claims section below and accept the best match.</p>
            </div>
            <Link href="#claims" className="inline-flex items-center gap-1 text-yellow-900 underline-offset-4 hover:underline">
              <span className="text-xs font-semibold">Go to claims</span>
              <ArrowDown className="size-4 shrink-0" aria-hidden />
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          {imageList.length ? (
            <ItemImageGallery images={imageList} fallbackAlt={item.title} />
          ) : (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted">
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No photo provided
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>
            <p className="text-sm text-muted-foreground">
              {item.category} · {item.location} · {itemDateLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <TypeBadge type={item.type} />
            <StatusBadge status={item.status} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/search" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Back to search
            </Link>
            {isAdmin && item.status === "pending" ? (
              <form action={approveItem}>
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" size="sm">
                  Approve
                </Button>
              </form>
            ) : null}
            <CopyLinkButton />
          </div>

          {!showContacts ? (
            <div className="rounded-lg border bg-card p-3 text-sm">
              <div className="flex items-center gap-2">
                <UserAvatar name={item.user.name} className="size-8 text-[10px]" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Posted by</p>
                  <p className="font-medium">{item.user.name}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Contact details are shared only after a claim is accepted and the item is marked returned.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {showClaimsSection ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">You have {item.claims.length} claim(s) on this item!</p>
          <p className="text-xs text-amber-900/80">Review carefully before accepting — accepting automatically marks the item returned.</p>
        </div>
      ) : null}

      {showClaimsSection ? (
        <section id="claims" className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold">Claims</h2>
            <p className="text-sm text-muted-foreground">{pendingClaimsCount} pending</p>
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
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.description}</p>
      </section>

      {showContacts ? (
        <div className="space-y-3">
          {showReunionContacts ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
              <p className="font-semibold">Item reunited! Contact each other to arrange the handover.</p>
              <p className="text-xs text-emerald-900/80">Please coordinate safely on campus and confirm details before meeting.</p>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {showAdminContacts || isAcceptedClaimant ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Poster contact</CardTitle>
                  <CardDescription>
                    {showAdminContacts ? "Admin visibility." : "Visible after your claim is accepted."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-3 rounded-lg border bg-background/80 p-3">
                    <UserAvatar name={item.user.name} className="size-8 text-[10px]" />
                    <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                      <p className="font-medium">{item.user.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-lg border bg-background/80 p-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                      {item.user.email ? (
                        <a className="font-medium text-primary underline-offset-4 hover:underline" href={`mailto:${item.user.email}`}>
                          {item.user.email}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">No email on file</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-lg border bg-background/80 p-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                      {item.user.phone ? (
                        <a className="font-medium text-primary underline-offset-4 hover:underline" href={`tel:${item.user.phone}`}>
                          {item.user.phone}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">No phone provided</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {showAdminContacts || isOwner ? (
              acceptedClaimGlobal ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Claimant contact</CardTitle>
                    <CardDescription>{showAdminContacts ? "Admin visibility." : "Accepted claimant details."}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex gap-3 rounded-lg border bg-background/80 p-3">
                      <UserAvatar name={acceptedClaimGlobal.claimant.name} className="size-8 text-[10px]" />
                      <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                        <p className="font-medium">{acceptedClaimGlobal.claimant.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-lg border bg-background/80 p-3">
                      <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                        {acceptedClaimGlobal.claimant.email ? (
                          <a
                            className="font-medium text-primary underline-offset-4 hover:underline"
                            href={`mailto:${acceptedClaimGlobal.claimant.email}`}
                          >
                            {acceptedClaimGlobal.claimant.email}
                          </a>
                        ) : (
                          <p className="text-muted-foreground">No email on file</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-lg border bg-background/80 p-3">
                      <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                        {acceptedClaimGlobal.claimant.phone ? (
                          <a
                            className="font-medium text-primary underline-offset-4 hover:underline"
                            href={`tel:${acceptedClaimGlobal.claimant.phone}`}
                          >
                            {acceptedClaimGlobal.claimant.phone}
                          </a>
                        ) : (
                          <p className="text-muted-foreground">No phone provided</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Claimant contact</CardTitle>
                    <CardDescription>No accepted claim on file.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    This listing is returned, but there is no accepted claim record.
                  </CardContent>
                </Card>
              )
            ) : null}
          </div>
        </div>
      ) : null}

      {canSubmitClaim ? (
        <ClaimForm
          itemId={item.id}
          itemType={item.type === "found" ? "found" : "lost"}
          verificationQuestion={item.verificationQuestion}
        />
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Related Items</h2>
          <p className="text-sm text-muted-foreground">
            Opposite-type listings that share the same category and location, or overlap on title keywords (excluding common
            words).
          </p>
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No strong matches yet.</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {matches.map((m) => (
              <div key={m.id} className="min-w-[260px]">
                <ItemCard item={m} />
              </div>
            ))}
            <Link href="/search" className="self-center text-sm text-primary underline-offset-4 hover:underline">
              See more
            </Link>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Comments ({item.comments.length})</h2>
        {isLoggedIn ? (
          <form action={postComment} className="space-y-2 rounded-lg border p-3">
            <input type="hidden" name="itemId" value={item.id} />
            <textarea
              name="text"
              required
              className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="I saw a similar item near the cafeteria..."
            />
            <button className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground">Post Comment</button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Login to comment
            </Link>
          </p>
        )}
        {item.comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <div className="space-y-2">
            {item.comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4 text-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <UserAvatar name={comment.user.name} className="size-6 text-[10px]" />
                    <p className="font-medium">{comment.user.name}</p>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p>{comment.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
