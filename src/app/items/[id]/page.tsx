import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ArrowDown, Clock, Mail, Phone, User } from "lucide-react";
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
import { StatusBadge, TypeBadge, ClaimStatusBadge, ExpiredBadge } from "@/components/badges";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
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
import { PageContent } from "@/components/motion-primitives";

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
    <>
      <ReunionConfetti itemId={item.id} enabled={celebrate} />
      <SuccessStoryPromptDialog itemId={item.id} defaultOpen={promptStory} />
      <PageContent className="space-y-10 pb-20 sm:pb-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/search">Search</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/search?category=${encodeURIComponent(item.category)}`}>{item.category}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{item.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Alert>
        <Clock className="size-4" />
        <AlertTitle>Posted {postedAgo}</AlertTitle>
        <AlertDescription>{item.location} · {itemDateLabel}</AlertDescription>
      </Alert>

      {stale ? (
        <Alert variant="warning">
          <AlertTitle>This listing may be stale</AlertTitle>
          <AlertDescription>
            Posted over a month ago — the item may no longer be available. <ExpiredBadge />
          </AlertDescription>
        </Alert>
      ) : null}

      {isOwner && pendingClaimsCount > 0 ? (
        <Alert variant="warning">
          <AlertTitle>{pendingClaimsCount} new claim(s) waiting for review</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            <span>Review the claims section below and accept the best match.</span>
            <Link href="#claims" className="inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline">
              Go to claims <ArrowDown className="size-4" aria-hidden />
            </Link>
          </AlertDescription>
        </Alert>
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
            <h1 className="font-heading text-3xl font-semibold tracking-tight">{item.title}</h1>
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
        <Alert variant="warning">
          <AlertTitle>You have {item.claims.length} claim(s) on this item</AlertTitle>
          <AlertDescription>Review carefully — accepting automatically marks the item returned.</AlertDescription>
        </Alert>
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
                  claim.status === "accepted" && "border-status-claimed-border bg-status-claimed/30",
                  claim.status === "rejected" && "opacity-60",
                )}
              >
                <CardContent className="space-y-2 pt-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <UserAvatar name={claim.claimant.name} className="size-7 text-[10px]" />
                    <p className="font-medium">{claim.claimant.name}</p>
                    <ClaimStatusBadge status={claim.status} />
                    {item.type === "found" && item.verificationQuestion ? (
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-xs",
                          claim.verificationMatched
                            ? "border-status-approved-border bg-status-approved text-status-approved-fg"
                            : "border-status-pending-border bg-status-pending text-status-pending-fg",
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
                        <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
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
            <Alert variant="success">
              <AlertTitle>Item reunited!</AlertTitle>
              <AlertDescription>Contact each other to arrange the handover. Coordinate safely on campus.</AlertDescription>
            </Alert>
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
            <Textarea
              name="text"
              required
              placeholder="I saw a similar item near the cafeteria..."
            />
            <Button type="submit" size="sm">Post Comment</Button>
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
    </PageContent>
    </>
  );
}
