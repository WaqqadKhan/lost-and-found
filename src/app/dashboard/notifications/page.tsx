import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { markAllNotificationsRead, markNotificationRead } from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

export default async function NotificationsPage() {
  const session = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Updates for approvals, rejections, and claim activity.
          </p>
        </div>
        <form action={markAllNotificationsRead}>
          <Button type="submit" variant="outline" size="sm">
            Mark all as read
          </Button>
        </form>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="All caught up!"
          description="No new notifications."
          ctaLabel="Browse items"
          ctaHref="/search"
        />
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => {
            const when = new Date(n.createdAt).toLocaleString();
            return (
              <li
                key={n.id}
                className={cn(
                  "rounded-xl border bg-card p-4 shadow-sm",
                  !n.read && "border-sky-200 bg-sky-50/80 dark:border-sky-900 dark:bg-sky-950/40",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <form action={markNotificationRead}>
                      <input type="hidden" name="id" value={n.id} />
                      <button
                        type="submit"
                        className="w-full text-left text-sm font-medium leading-snug hover:underline"
                      >
                        {n.message}
                      </button>
                    </form>
                    <p className="text-xs text-muted-foreground">{when}</p>
                    <p className="text-xs text-muted-foreground">
                      Status: {n.read ? "Read" : "Unread"} · Type: {n.type}
                    </p>
                    {n.itemId ? (
                      <Link
                        href={`/items/${n.itemId}`}
                        className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        View listing
                      </Link>
                    ) : null}
                  </div>
                  <form action={markNotificationRead} className="shrink-0">
                    <input type="hidden" name="id" value={n.id} />
                    <Button type="submit" variant="secondary" size="sm">
                      Mark read
                    </Button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
