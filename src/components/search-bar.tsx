"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES } from "@/lib/constants";

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
      router.replace(href, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, category, location, type, sort, targetPath, router, hasInteracted]);

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-0 flex-1 space-y-1">
        <Input
          className="h-10"
          placeholder="Search by title..."
          value={keyword}
          onChange={(e) => {
            setHasInteracted(true);
            setKeyword(e.target.value);
          }}
        />
      </div>
      <div className="w-full space-y-1 sm:w-44">
        <select
          value={category}
          onChange={(e) => {
            setHasInteracted(true);
            setCategory(e.target.value);
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
        >
          <option value="">All categories</option>
          {ITEM_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full space-y-1 sm:w-40">
        <select
          value={type}
          onChange={(e) => {
            setHasInteracted(true);
            setType(e.target.value);
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
        >
          <option value="">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <Input
          className="h-10"
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
      <div className="w-full space-y-1 sm:w-40">
        <select
          value={sort}
          onChange={(e) => {
            setHasInteracted(true);
            setSort(e.target.value);
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
  );
}
