import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { CheckCircle2, Search, Upload } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search-bar";
import { ItemCard } from "@/components/item-card";
import { StatsBar } from "@/components/stats-bar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QUICK_SEARCH_TAGS } from "@/lib/constants";
import { authOptions } from "@/lib/auth";
import { formatTimeAgo } from "@/lib/time";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const lostTarget = session ? "/dashboard/add?type=lost" : "/login";
  const foundTarget = session ? "/dashboard/add?type=found" : "/login";

  const items = await prisma.item.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  const [totalItems, recovered, activeListings, users, stories] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({ where: { status: "returned" } }),
    prisma.item.count({ where: { status: "approved" } }),
    prisma.user.count(),
    prisma.successStory.findMany({
      orderBy: { createdAt: "desc" },
      include: { item: true, user: true },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-12">
      <section className="rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Campus Lost &amp; Found
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Lost Something? Found Something? We&apos;ll Help You Reconnect.
          </h1>
          <p className="text-balance text-sm text-muted-foreground sm:text-base">
            The university&apos;s central hub for lost and found items. Post, search, and recover.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link href={lostTarget} className={cn(buttonVariants({ variant: "destructive" }))}>
              Report Lost Item
            </Link>
            <Link
              href={foundTarget}
              className={cn(buttonVariants({ variant: "outline" }), "border-green-600 text-green-700 hover:bg-green-50")}
            >
              Report Found Item
            </Link>
          </div>
        </div>
      </section>

      <StatsBar
        itemsPosted={totalItems}
        itemsRecovered={recovered}
        activeListings={activeListings}
        users={users}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Quick Search</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_SEARCH_TAGS.map((tag) => (
            <Link
              key={tag}
              href={`/search?keyword=${encodeURIComponent(tag)}`}
              className="rounded-full border bg-muted px-3 py-1 text-sm hover:bg-muted/80"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Search listings</h2>
            <p className="text-sm text-muted-foreground">
              Filter by title, category, or location. Only approved items appear in results.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Find an item</CardTitle>
            <CardDescription>
              Matches are limited to approved posts. Sign in to report something new.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SearchBar targetPath="/search" />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">How It Works</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="size-4" /> Step 1: Report
              </CardTitle>
              <CardDescription>
                Lost or found something? Post it with a photo and details.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="size-4" /> Step 2: Match
              </CardTitle>
              <CardDescription>
                Our system suggests potential matches automatically.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="size-4" /> Step 3: Recover
              </CardTitle>
              <CardDescription>
                Connect with the finder/owner and get your item back.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Recently Posted</h2>
          <Link
            href="/search"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View all
          </Link>
        </div>
        {items.length === 0 ? (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            No items found. Be the first to report!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
        <div>
          <Link href="/search" className="text-sm text-primary underline-offset-4 hover:underline">
            View All Items
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Happy Returns</h2>
          <Link href="/stories" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            View All Stories
          </Link>
        </div>
        {stories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reunion stories yet. Be the first success!</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stories.map((story) => (
              <Card key={story.id}>
                <CardHeader>
                  <CardTitle className="text-base">{story.item.title}</CardTitle>
                  <CardDescription>
                    {story.user.name.split(" ")[0]} · {formatTimeAgo(story.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {story.message?.trim() || "Recovered successfully. Thank you for helping reunite this item."}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
