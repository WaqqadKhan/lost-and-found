import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Mail, Phone, User } from "lucide-react";
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClaimForm, CopyLinkButton, ItemImageGallery } from "@/components/item-interactions";
import { decideClaim, postComment } from "@/app/actions/community";
import { UserAvatar } from "@/components/user-avatar";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { name: true, email: true, phone: true },
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
  const isOwner = session?.user?.id === item.userId;
  const isAdmin = session?.user?.role === "admin";
  const isLoggedIn = Boolean(session?.user?.id);
  const canView = item.status === "approved" || isOwner || isAdmin;

  if (!canView) {
    notFound();
  }

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
      <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        Posted {postedAgo}
      </div>
      {stale ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          This item was posted over a month ago and may no longer be available.
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
          <div className="flex flex-wrap gap-2">
            <TypeBadge type={item.type} />
            <StatusBadge status={item.status} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>
            <p className="text-sm text-muted-foreground">
              {item.category} · {item.location} · {itemDateLabel}
            </p>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.description}</p>

          <Card className="border-2 border-primary/20 bg-muted/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Contact information</CardTitle>
              <CardDescription>
                Reach out to the poster directly. Email and phone are verified at post time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3 rounded-lg border bg-background/80 p-3">
                <UserAvatar name={item.user.name} className="size-8 text-[10px]" />
                <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Name
                  </p>
                  <p className="font-medium">{item.user.name}</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border bg-background/80 p-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>
                  {item.user.email ? (
                    <a
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      href={`mailto:${item.user.email}`}
                    >
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Phone
                  </p>
                  {item.user.phone ? (
                    <a
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      href={`tel:${item.user.phone}`}
                    >
                      {item.user.phone}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">No phone provided</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Link href="/search" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Back to search
            </Link>
            <CopyLinkButton />
          </div>

          {!isOwner && isLoggedIn ? (
            <ClaimForm itemId={item.id} verificationQuestion={item.verificationQuestion} />
          ) : null}
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Related Items</h2>
          <p className="text-sm text-muted-foreground">
            Opposite-type listings that share the same category and location, or overlap on title
            keywords (excluding common words).
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

      {isOwner ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Claims ({item.claims.length})</h2>
          {item.claims.length === 0 ? (
            <p className="text-sm text-muted-foreground">No claims yet.</p>
          ) : (
            <div className="space-y-3">
              {item.claims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="space-y-2 pt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={claim.claimant.name} className="size-7 text-[10px]" />
                      <p className="font-medium">{claim.claimant.name}</p>
                      <StatusBadge status={claim.status} />
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${claim.verificationMatched ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}
                      >
                        {claim.verificationMatched ? "Verified" : "Unverified"}
                      </span>
                    </div>
                    <p>{claim.message}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(claim.createdAt)}</p>
                    {claim.status === "accepted" ? (
                      <div className="rounded border bg-muted/40 p-2 text-xs">
                        <p>{claim.claimant.email}</p>
                        <p>{claim.claimant.phone || "No phone provided"}</p>
                      </div>
                    ) : null}
                    {claim.status === "pending" ? (
                      <div className="flex gap-2">
                        <form action={decideClaim}>
                          <input type="hidden" name="claimId" value={claim.id} />
                          <input type="hidden" name="decision" value="accepted" />
                          <button className="rounded bg-green-600 px-3 py-1 text-xs text-white">Accept</button>
                        </form>
                        <form action={decideClaim}>
                          <input type="hidden" name="claimId" value={claim.id} />
                          <input type="hidden" name="decision" value="rejected" />
                          <button className="rounded bg-red-600 px-3 py-1 text-xs text-white">Reject</button>
                        </form>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      ) : null}

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
            <button className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground">
              Post Comment
            </button>
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
