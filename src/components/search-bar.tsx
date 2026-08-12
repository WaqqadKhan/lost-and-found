"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FancySelect } from "@/components/ui/select";
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SearchBar({
  defaultKeyword = "",
  defaultCategory = "",
  defaultLocation = "",
  defaultType = "",
  defaultSort = "newest",
  targetPath = "/search",
}: {
  defaultKeyword?: string;
  defaultCategory?: string;
  defaultLocation?: string;
  defaultType?: string;
  defaultSort?: string;
  targetPath?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [category, setCategory] = useState(defaultCategory);
  const [location, setLocation] = useState(defaultLocation);
  const [type, setType] = useState(defaultType);
  const [sort, setSort] = useState(defaultSort);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setKeyword(defaultKeyword);
    setCategory(defaultCategory);
    setLocation(defaultLocation);
    setType(defaultType);
    setSort(defaultSort);
    setHasInteracted(false);
  }, [defaultKeyword, defaultCategory, defaultLocation, defaultType, defaultSort]);

  useEffect(() => {
    if (!hasInteracted) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set("keyword", keyword.trim());
      if (category.trim()) params.set("category", category.trim());
      if (type.trim()) params.set("type", type.trim());
      if (location.trim()) params.set("location", location.trim());
      if (sort && sort !== "newest") params.set("sort", sort);
      const query = params.toString();
      const href = query ? `${targetPath}?${query}` : targetPath;
      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    }, 180);

    return () => clearTimeout(timer);
  }, [keyword, category, location, type, sort, targetPath, router, hasInteracted]);

  return (
    <div className="relative space-y-2">
      <div
        className={cn(
          "flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end",
          isPending && "opacity-80",
        )}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <Input
            className="h-10 rounded-xl"
            placeholder="Search by title..."
            value={keyword}
            onChange={(e) => {
              setHasInteracted(true);
              setKeyword(e.target.value);
            }}
          />
        </div>
        <div className="w-full space-y-1 sm:w-48">
          <FancySelect
            value={category}
            onValueChange={(v) => {
              setHasInteracted(true);
              setCategory(v);
            }}
            placeholder="All categories"
            options={[
              { value: "", label: "All categories" },
              ...ITEM_CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
          />
        </div>
        <div className="w-full space-y-1 sm:w-40">
          <FancySelect
            value={type}
            onValueChange={(v) => {
              setHasInteracted(true);
              setType(v);
            }}
            placeholder="All types"
            options={[
              { value: "", label: "All types" },
              { value: "lost", label: "Lost" },
              { value: "found", label: "Found" },
            ]}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <Input
            className="h-10 rounded-xl"
            placeholder="Location"
            value={location}
            list="campus-locations"
            onChange={(e) => {
              setHasInteracted(true);
              setLocation(e.target.value);
            }}
          />
          <datalist id="campus-locations">
            {CAMPUS_LOCATIONS.map((place) => (
              <option key={place} value={place} />
            ))}
          </datalist>
        </div>
        <div className="w-full space-y-1 sm:w-44">
          <FancySelect
            value={sort}
            onValueChange={(v) => {
              setHasInteracted(true);
              setSort(v);
            }}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
            ]}
          />
        </div>
      </div>
      {isPending ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground" role="status">
          <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden />
          Updating results…
        </p>
      ) : null}
    </div>
  );
}
