import { ItemGridSkeleton } from "@/components/item-card-skeleton";
import { PageSpinner } from "@/components/page-spinner";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-40 rounded-xl" />
      <ItemGridSkeleton count={6} />
      <PageSpinner label="Searching…" compact />
    </div>
  );
}
