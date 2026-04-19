import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search-bar";
import { ItemCard } from "@/components/item-card";
import Link from "next/link";
import { QUICK_SEARCH_TAGS } from "@/lib/constants";
import { X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: {
    keyword?: string;
    category?: string;
    location?: string;
    type?: string;
    page?: string;
    sort?: string;
  };
}) {
  const keyword = (searchParams.keyword || "").trim();
  const category = (searchParams.category || "").trim();
  const location = (searchParams.location || "").trim();
  const type = (searchParams.type || "").trim();
  const sort = searchParams.sort === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Number(searchParams.page || "1") || 1);
  const perPage = 12;

  const filters: Record<string, unknown>[] = [];
  if (keyword) {
    filters.push({
      title: {
        contains: keyword,
      },
    });
  }
  if (category) {
    filters.push({
      category: {
        equals: category,
      },
    });
  }
  if (location) {
    filters.push({
      location: {
        contains: location,
      },
    });
  }
  if (type) {
    filters.push({
      type: {
        equals: type,
      },
    });
  }

  const items = await prisma.item.findMany({
    where: {
      status: "approved",
      ...(filters.length ? { AND: filters } : {}),
    },
    orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  const total = await prisma.item.count({
    where: {
      status: "approved",
      ...(filters.length ? { AND: filters } : {}),
    },
  });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const locationGroups = await prisma.item.groupBy({
    by: ["location"],
    where: { status: "approved" },
    _count: { location: true },
    orderBy: { _count: { location: "desc" } },
    take: 12,
  });

  const activeFilterCount = [keyword, category, location, type].filter(Boolean).length;
  const baseParams = new URLSearchParams();
  if (keyword) baseParams.set("keyword", keyword);
  if (category) baseParams.set("category", category);
  if (location) baseParams.set("location", location);
  if (type) baseParams.set("type", type);
  if (sort !== "newest") baseParams.set("sort", sort);
  const pageHref = (p: number) => {
    const q = new URLSearchParams(baseParams);
    if (p > 1) q.set("page", String(p));
    return `/search${q.toString() ? `?${q.toString()}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground">
          Browse approved listings. Leave fields blank to see the most recent posts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Keyword searches the title. Location uses a partial match.</CardDescription>
        </CardHeader>
        <CardContent>
          <SearchBar
            defaultKeyword={keyword}
            defaultCategory={category}
            defaultLocation={location}
            defaultType={type}
            defaultSort={sort}
            targetPath="/search"
          />
        </CardContent>
      </Card>

      {activeFilterCount === 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Popular searches</h3>
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCH_TAGS.map((tag) => (
              <Link
                key={tag}
                href={`/search?keyword=${encodeURIComponent(tag)}`}
                className="rounded-full border bg-muted px-3 py-1 text-sm hover:bg-muted/70"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Browse by Location</h3>
        <div className="flex flex-wrap gap-2">
          {locationGroups.map((group) => (
            <Link
              key={group.location}
              href={`/search?location=${encodeURIComponent(group.location)}`}
              className="rounded-full border bg-muted px-3 py-1 text-sm hover:bg-muted/70"
            >
              {group.location} ({group._count.location})
            </Link>
          ))}
        </div>
      </section>

      {activeFilterCount > 0 ? (
        <section className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {keyword ? (
              <Link
                href={`/search?${new URLSearchParams({ ...(category && { category }), ...(location && { location }), ...(type && { type }), ...(sort !== "newest" && { sort }) }).toString()}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm"
              >
                <span className="inline-flex items-center gap-1">{keyword} <X className="size-3" /></span>
              </Link>
            ) : null}
            {category ? (
              <Link
                href={`/search?${new URLSearchParams({ ...(keyword && { keyword }), ...(location && { location }), ...(type && { type }), ...(sort !== "newest" && { sort }) }).toString()}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm"
              >
                <span className="inline-flex items-center gap-1">{category} <X className="size-3" /></span>
              </Link>
            ) : null}
            {type ? (
              <Link
                href={`/search?${new URLSearchParams({ ...(keyword && { keyword }), ...(category && { category }), ...(location && { location }), ...(sort !== "newest" && { sort }) }).toString()}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm"
              >
                <span className="inline-flex items-center gap-1">{type} <X className="size-3" /></span>
              </Link>
            ) : null}
            {location ? (
              <Link
                href={`/search?${new URLSearchParams({ ...(keyword && { keyword }), ...(category && { category }), ...(type && { type }), ...(sort !== "newest" && { sort }) }).toString()}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm"
              >
                <span className="inline-flex items-center gap-1">{location} <X className="size-3" /></span>
              </Link>
            ) : null}
            {activeFilterCount >= 2 ? (
              <Link href="/search" className="text-sm text-primary underline-offset-4 hover:underline">
                Clear all filters
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">
            Results <span className="text-sm font-normal text-muted-foreground">({total})</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Showing {from}-{to} of {total} results
          </p>
        </div>
        {items.length === 0 ? (
          <EmptyState
            title="No items match your search"
            description="Try different keywords or remove some filters."
            ctaLabel="Clear filters"
            ctaHref="/search"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link
              href={pageHref(Math.max(1, page - 1))}
              className="rounded-md border px-3 py-1 text-sm disabled:pointer-events-none"
            >
              Previous
            </Link>
            {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
              const p = idx + 1;
              return (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className={`rounded-md border px-3 py-1 text-sm ${p === page ? "bg-primary text-primary-foreground" : ""}`}
                >
                  {p}
                </Link>
              );
            })}
            <Link href={pageHref(Math.min(totalPages, page + 1))} className="rounded-md border px-3 py-1 text-sm">
              Next
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
