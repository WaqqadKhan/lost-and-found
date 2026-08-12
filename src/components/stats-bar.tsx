"use client";

import { Counter } from "@/components/stats-counter";

export function StatsBar({
  itemsPosted,
  itemsRecovered,
  activeListings,
  users,
}: {
  itemsPosted: number;
  itemsRecovered: number;
  activeListings: number;
  users: number;
}) {
  const stats = [
    { label: "Items Posted", value: itemsPosted },
    { label: "Items Recovered", value: itemsRecovered },
    { label: "Active Listings", value: activeListings },
    { label: "Registered Users", value: users },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border bg-card p-4 shadow-card sm:grid-cols-4">
      {stats.map((it) => (
        <div key={it.label} className="text-center">
          <p className="font-heading text-2xl font-bold text-primary">
            <Counter value={it.value} />
          </p>
          <p className="text-xs text-muted-foreground">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
