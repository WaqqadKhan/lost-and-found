import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { deleteMyItem } from "@/app/actions/items";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, TypeBadge } from "@/components/badges";
import { cn } from "@/lib/utils";
import { ReturnItemDialog } from "@/components/return-item-dialog";
import { formatTimeAgo } from "@/lib/time";

export default async function MyItemsPage() {
  const session = await requireUser();
  const items = await prisma.item.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My items</h1>
          <p className="text-sm text-muted-foreground">
            Manage the reports you have submitted.
          </p>
        </div>
        <Link href="/dashboard/add" className={cn(buttonVariants())}>
          New report
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">You have not posted any items yet.</p>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const when = formatTimeAgo(item.createdAt);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[220px] whitespace-normal font-medium">
                      {item.title}
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={item.type} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{when}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/items/${item.id}`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          View
                        </Link>
                        {item.status === "approved" ? (
                          <ReturnItemDialog itemId={item.id} />
                        ) : null}
                        <form action={deleteMyItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <Button type="submit" variant="destructive" size="sm">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
