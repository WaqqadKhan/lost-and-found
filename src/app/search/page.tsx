import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search-bar";
import { ItemCard } from "@/components/item-card";
import { SearchResults } from "@/components/search-results";
import { SearchPagination } from "@/components/search-pagination";
import { TagPill, FilterChip } from "@/components/filter-chip";
import { QUICK_SEARCH_TAGS } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageContent } from "@/components/motion-primitives";

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
  if (keyword) filters.push({ title: { contains: keyword } });
  if (category) filters.push({ category: { equals: category } });
  if (location) filters.push({ location: { contains: location } });
  if (type) filters.push({ type: { equals: type } });

  const where = {
    status: "approved" as const,
    ...(filters.length ? { AND: filters } : {}),
  };

  const [items, total, locationGroups] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
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
    prisma.item.count({ where }),
    prisma.item.groupBy({
      by: ["location"],
      where: { status: "approved" },
      _count: { location: true },
      orderBy: { _count: { location: "desc" } },
      take: 12,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
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

  const filterHref = (omit: "keyword" | "category" | "location" | "type") => {
    const q = new URLSearchParams();
    if (omit !== "keyword" && keyword) q.set("keyword", keyword);
    if (omit !== "category" && category) q.set("category", category);
    if (omit !== "location" && location) q.set("location", location);
    if (omit !== "type" && type) q.set("type", type);
    if (sort !== "newest") q.set("sort", sort);
    return `/search${q.toString() ? `?${q.toString()}` : ""}`;
  };

  const resultsKey = `${keyword}-${category}-${location}-${type}-${sort}-${page}`;

  return (
    <PageContent className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground">
          Browse approved listings. Leave fields blank to see the most recent posts.
        </p>
      </div>

      <Card className="shadow-card">
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
              <TagPill key={tag} href={`/search?keyword=${encodeURIComponent(tag)}`}>
                {tag}
              </TagPill>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Browse by Location</h3>
        <div className="flex flex-wrap gap-2">
          {locationGroups.map((group) => (
            <TagPill key={group.location} href={`/search?location=${encodeURIComponent(group.location)}`}>
              {group.location} ({group._count.location})
            </TagPill>
          ))}
        </div>
      </section>

      {activeFilterCount > 0 ? (
        <section className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {keyword ? <FilterChip href={filterHref("keyword")} label={keyword} /> : null}
            {category ? <FilterChip href={filterHref("category")} label={category} /> : null}
            {type ? <FilterChip href={filterHref("type")} label={type} /> : null}
            {location ? <FilterChip href={filterHref("location")} label={location} /> : null}
            {activeFilterCount >= 2 ? (
              <a href="/search" className="text-sm text-primary underline-offset-4 hover:underline">
                Clear all filters
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-semibold">
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
          <SearchResults resultsKey={resultsKey}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <ItemCard key={item.id} item={item} index={i} />
              ))}
            </div>
          </SearchResults>
        )}
        {totalPages > 1 ? (
          <SearchPagination page={page} totalPages={totalPages} pageHref={pageHref} />
        ) : null}
      </section>
    </PageContent>
  );
}
