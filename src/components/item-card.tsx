import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TypeBadge } from "@/components/badges";

export type ItemCardModel = {
  id: string;
  title: string;
  type: string;
  location: string;
  date: Date;
  image: string | null;
};

export function ItemCard({ item }: { item: ItemCardModel }) {
  const when = new Date(item.date).toLocaleDateString();

  return (
    <Link href={`/items/${item.id}`} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No photo
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-sm leading-snug">
              {item.title}
            </CardTitle>
            <TypeBadge type={item.type} />
          </div>
        </CardHeader>
        <CardContent className="pb-2 pt-0 text-xs text-muted-foreground">
          <p className="line-clamp-1">{item.location}</p>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">{when}</CardFooter>
      </Card>
    </Link>
  );
}
