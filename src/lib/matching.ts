import { prisma } from "@/lib/prisma";
import { TITLE_STOP_WORDS } from "@/lib/constants";

function titleKeywords(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !TITLE_STOP_WORDS.has(w));
}

export async function findPossibleMatches(
  itemId: string,
  title: string,
  category: string,
  location: string,
  type: string,
) {
  const opposite = type === "lost" ? "found" : "lost";
  const words = titleKeywords(title);
  const cat = category.toLowerCase();
  const loc = location.toLowerCase();

  // Keep payload lean — matching only needs title/category/location/type + a thumbnail
  const candidates = await prisma.item.findMany({
    where: {
      id: { not: itemId },
      status: "approved",
      type: opposite,
    },
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
      user: { select: { name: true } },
    },
    take: 40,
    orderBy: { createdAt: "desc" },
  });

  const matches: typeof candidates = [];
  for (const row of candidates) {
    const samePlace =
      row.category.toLowerCase() === cat && row.location.toLowerCase() === loc;
    const t = row.title.toLowerCase();
    const wordHit = words.some((w) => t.includes(w));
    if (samePlace || wordHit) {
      matches.push(row);
    }
    if (matches.length >= 5) break;
  }

  return matches;
}
