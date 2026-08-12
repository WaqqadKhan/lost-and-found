import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { CheckCircle2, Search, Upload } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search-bar";
import { ItemCard } from "@/components/item-card";
import { StatsBar } from "@/components/stats-bar";
import { HomeHero } from "@/components/home-hero";
import { EmptyState } from "@/components/empty-state";
import { TagPill } from "@/components/filter-chip";
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
import { PageContent } from "@/components/motion-primitives";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const lostTarget = session ? "/dashboard/add?type=lost" : "/login";
  const foundTarget = session ? "/dashboard/add?type=found" : "/login";

  const [items, totalItems, recovered, activeListings, users, stories] = await Promise.all([
    prisma.item.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        type: true,
        location: true,
        category: true,
        date: true,
        createdAt: true,
        image: true,
        images: true,
      },
    }),
    prisma.item.count(),
    prisma.item.count({ where: { status: "returned" } }),
    prisma.item.count({ where: { status: "approved" } }),
    prisma.user.count(),
    prisma.successStory.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        message: true,
        createdAt: true,
        item: { select: { title: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  return (
    <PageContent className="space-y-section">
      <HomeHero lostTarget={lostTarget} foundTarget={foundTarget} />

      <StatsBar
        itemsPosted={totalItems}
        itemsRecovered={recovered}
        activeListings={activeListings}
        users={users}
      />

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Quick Search</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_SEARCH_TAGS.map((tag) => (
            <TagPill key={tag} href={`/search?keyword=${encodeURIComponent(tag)}`}>
              {tag}
            </TagPill>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold">Search listings</h2>
            <p className="text-sm text-muted-foreground">
              Filter by title, category, or location. Only approved items appear in results.
            </p>
          </div>
        </div>
        <Card className="shadow-card">
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
        <h2 className="font-heading text-lg font-semibold">How It Works</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: Upload, title: "Step 1: Report", desc: "Lost or found something? Post it with a photo and details." },
            { icon: Search, title: "Step 2: Match", desc: "Our system suggests potential matches automatically." },
            { icon: CheckCircle2, title: "Step 3: Recover", desc: "Connect with the finder/owner and get your item back." },
          ].map((step) => (
            <Card key={step.title} className="shadow-card transition-shadow duration-normal ease-brand hover:shadow-card-hover motion-safe:hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <step.icon className="size-4 text-primary" /> {step.title}
                </CardTitle>
                <CardDescription>{step.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-semibold">Recently Posted</h2>
          <Link href="/search" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            View all
          </Link>
        </div>
        {items.length === 0 ? (
          <EmptyState
            title="No listings yet"
            description="Be the first to report a lost or found item on campus."
            ctaLabel="Browse search"
            ctaHref="/search"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-semibold">Happy Returns</h2>
          <Link href="/stories" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            View All Stories
          </Link>
        </div>
        {stories.length === 0 ? (
          <EmptyState
            title="No reunion stories yet"
            description="When items are recovered, success stories appear here."
            ctaLabel="View stories"
            ctaHref="/stories"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stories.map((story) => (
              <Card key={story.id} className="shadow-card transition-shadow duration-normal ease-brand hover:shadow-card-hover motion-safe:hover:-translate-y-0.5">
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
    </PageContent>
  );
}
