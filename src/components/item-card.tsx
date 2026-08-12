"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryIcon } from "@/components/category-icon";
import { ItemTypeChip, ItemStatusChip } from "@/components/badges";
import { formatTimeAgo, isWithinHours } from "@/lib/time";
import { defaultTransition, fadeUp, snappyTransition } from "@/lib/motion";

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

export function ItemCard({ item, index = 0 }: { item: ItemCardModel; index?: number }) {
  const reduceMotion = useReducedMotion();
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
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={fadeUp}
      transition={{
        ...(reduceMotion ? { duration: 0.01 } : defaultTransition),
        delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.15),
      }}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -3, scale: 1.012, transition: snappyTransition }
      }
      whileTap={
        reduceMotion
          ? undefined
          : { scale: 0.985, transition: snappyTransition }
      }
      className="h-full"
    >
      <Link href={`/items/${item.id}`} className="group block h-full cursor-pointer">
        <Card className="h-full overflow-hidden shadow-card transition-shadow duration-normal ease-brand group-hover:shadow-card-hover">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-normal ease-brand motion-safe:group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                <CategoryIcon category={item.category} className="size-10" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {isNew ? <ItemStatusChip label="New" variant="new" /> : null}
            </div>
            <div className="absolute right-2 top-2">
              <ItemTypeChip type={item.type} className={lost ? "" : ""} />
            </div>
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
    </motion.div>
  );
}
