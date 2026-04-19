import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search-bar";
import { ItemCard } from "@/components/item-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { keyword?: string; category?: string; location?: string; type?: string };
}) {
  const keyword = (searchParams.keyword || "").trim();
  const category = (searchParams.category || "").trim();
  const location = (searchParams.location || "").trim();
  const type = (searchParams.type || "").trim();

  const filters = [];
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
    orderBy: { createdAt: "desc" },
    take: 60,
  });

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
            targetPath="/search"
          />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          Results{" "}
          <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items matched your filters.</p>
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
