"use client";

import { useEffect, useState } from "react";

function Counter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 700;
    const step = Math.max(1, Math.floor(value / 20));
    const interval = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(start);
      }
    }, duration / 20);
    return () => clearInterval(interval);
  }, [value]);
  return <span>{display}</span>;
}

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
  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border bg-card p-4 sm:grid-cols-4">
      {[
        { label: "Items Posted", value: itemsPosted },
        { label: "Items Recovered", value: itemsRecovered },
        { label: "Active Listings", value: activeListings },
        { label: "Registered Users", value: users },
      ].map((it) => (
        <div key={it.label} className="text-center">
          <p className="text-2xl font-bold">
            <Counter value={it.value} />
          </p>
          <p className="text-xs text-muted-foreground">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
