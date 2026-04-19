import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatTimeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

export default async function StoriesPage() {
  const stories = await prisma.successStory.findMany({
    include: { item: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reunion Success Stories</h1>
          <p className="text-sm text-muted-foreground">Celebrating recovered items and kind helpers.</p>
        </div>
        <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Back home
        </Link>
      </div>
      {stories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stories yet.</p>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <Card key={story.id}>
              <CardHeader>
                <CardTitle className="text-base">{story.item.title}</CardTitle>
                <CardDescription>
                  {story.user.name} · {formatTimeAgo(story.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {story.message?.trim() || "Recovered successfully and marked as returned."}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
