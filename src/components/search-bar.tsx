"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ITEM_CATEGORIES } from "@/lib/constants";

export function SearchBar({
  defaultKeyword = "",
  defaultCategory = "",
  defaultLocation = "",
  defaultType = "",
  targetPath = "/search",
}: {
  defaultKeyword?: string;
  defaultCategory?: string;
  defaultLocation?: string;
  defaultType?: string;
  targetPath?: string;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [category, setCategory] = useState(defaultCategory);
  const [location, setLocation] = useState(defaultLocation);
  const [type, setType] = useState(defaultType);

  useEffect(() => {
    setKeyword(defaultKeyword);
    setCategory(defaultCategory);
    setLocation(defaultLocation);
    setType(defaultType);
  }, [defaultKeyword, defaultCategory, defaultLocation, defaultType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set("keyword", keyword.trim());
      if (category.trim()) params.set("category", category.trim());
      if (type.trim()) params.set("type", type.trim());
      if (location.trim()) params.set("location", location.trim());
      const query = params.toString();
      const href = query ? `${targetPath}?${query}` : targetPath;
      router.replace(href, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, category, location, type, targetPath, router]);

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-0 flex-1 space-y-1">
        <Input
          className="h-10"
          placeholder="Search by title..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      <div className="w-full space-y-1 sm:w-44">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
          onChange={(e) => setType(e.target.value)}
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
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
    </div>
  );
}
