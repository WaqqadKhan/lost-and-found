import { EmptyState } from "@/components/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="This listing or page doesn't exist, or you may not have permission to view it."
      ctaLabel="Browse listings"
      ctaHref="/search"
      icon="search"
    />
  );
}
