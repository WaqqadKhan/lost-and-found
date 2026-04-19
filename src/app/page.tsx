import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search-bar";
import { ItemCard } from "@/components/item-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HomePage() {
  const items = await prisma.item.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Campus Lost &amp; Found
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Reunite people with what matters
          </h1>
          <p className="text-balance text-sm text-muted-foreground sm:text-base">
            Post lost or found reports, browse approved listings, and contact owners
            securely. Built for students and staff—runs entirely on this site.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link href="/register" className={cn(buttonVariants())}>
              Create an account
            </Link>
            <Link
              href="/search"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Browse listings
            </Link>
          </div>
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
            <SearchBar />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Latest approved listings</h2>
          <Link
            href="/search"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View all
          </Link>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No approved items yet. Check back soon or sign in to submit the first report.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
