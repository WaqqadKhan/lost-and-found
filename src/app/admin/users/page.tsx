import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { deleteUserAdmin } from "@/app/actions/admin";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageContent } from "@/components/motion-primitives";

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  });

  return (
    <PageContent className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Manage users</h1>
        <p className="text-sm text-muted-foreground">
          Review accounts and remove users who should no longer access the system.
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const joined = new Date(user.createdAt).toLocaleDateString();
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="whitespace-normal">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{joined}</TableCell>
                  <TableCell>{user._count.items}</TableCell>
                  <TableCell className="text-right">
                    {user.id === session.user.id ? (
                      <span className="text-xs text-muted-foreground">Current admin</span>
                    ) : (
                      <ConfirmDeleteButton
                        label="Delete"
                        title="Delete this user?"
                        description="This permanently removes the account and related data."
                        formAction={deleteUserAdmin}
                        hiddenFields={{ id: user.id }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </PageContent>
  );
}
