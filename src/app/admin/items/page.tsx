import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { approveItem, deleteItemAdmin } from "@/app/actions/admin";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, TypeBadge } from "@/components/badges";

export default async function AdminItemsPage() {
  await requireAdmin();

  const items = await prisma.item.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manage items</h1>
        <p className="text-sm text-muted-foreground">
          Approve pending posts or remove anything that breaks the guidelines.
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Posted by</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const when = new Date(item.date).toLocaleDateString();
              return (
                <TableRow key={item.id}>
                  <TableCell className="max-w-[200px] whitespace-normal font-medium">
                    <Link
                      href={`/items/${item.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={item.type} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="whitespace-normal text-sm">
                    <div className="font-medium">{item.user.name}</div>
                    <div className="text-muted-foreground">{item.user.email}</div>
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
                      <Link
                        href={`/admin/items/${item.id}/edit`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Edit
                      </Link>
                      {item.status === "pending" ? (
                        <form action={approveItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <Button type="submit" size="sm">
                            Approve
                          </Button>
                        </form>
                      ) : null}
                      <form action={deleteItemAdmin}>
                        <input type="hidden" name="id" value={item.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          {item.status === "pending" ? "Reject" : "Delete"}
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
    </div>
  );
}
