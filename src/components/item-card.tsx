import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryIcon } from "@/components/category-icon";
import { formatTimeAgo, isWithinHours } from "@/lib/time";

export type ItemCardModel = {
  id: string;
  title: string;
  type: string;
  location: string;
  category: string;
  date: Date;
  createdAt: Date;
  image: string | null;
  images?: string | null;
};

export function ItemCard({ item }: { item: ItemCardModel }) {
  const when = formatTimeAgo(item.createdAt || item.date);
  const exact = new Date(item.createdAt || item.date).toLocaleString();
  const isNew = isWithinHours(item.createdAt || item.date, 24);
  let imageList: string[] = [];
  if (item.images) {
    try {
      imageList = JSON.parse(item.images) as string[];
    } catch {
      imageList = [];
    }
  }
  const primaryImage = imageList[0] || item.image;
  const lost = item.type.toLowerCase() === "lost";

  return (
    <Link href={`/items/${item.id}`} className="block h-full cursor-pointer">
      <Card className="h-full overflow-hidden transition duration-200 hover:scale-[1.02] hover:shadow-lg">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={item.title}
              fill
              className="rounded-none object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-900">
              <CategoryIcon category={item.category} className="size-10" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
          {isNew ? (
            <span className="absolute left-2 top-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
              NEW
            </span>
          ) : null}
          <span
            className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-semibold text-white ${lost ? "bg-red-500" : "bg-green-600"}`}
          >
            {lost ? "Lost" : "Found"}
          </span>
        </div>
        <CardHeader className="pb-2">
          <div className="space-y-1">
            <CardTitle className="line-clamp-2 text-sm leading-snug">{item.title}</CardTitle>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CategoryIcon category={item.category} className="size-3.5" />
              {item.category}
            </p>
          </div>
        </CardHeader>
        <CardContent className="pb-2 pt-0 text-xs text-muted-foreground">
          <p className="line-clamp-1">{item.location}</p>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground" title={exact}>
          {when}
        </CardFooter>
      </Card>
    </Link>
  );
}
