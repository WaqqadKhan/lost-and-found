import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { AdminEditItemForm } from "@/components/admin-edit-item-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminEditItemPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const item = await prisma.item.findUnique({ where: { id: params.id } });
  if (!item) {
    notFound();
  }

  const dateStr = item.date.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit listing</h1>
        <p className="text-sm text-muted-foreground">Update details for: {item.title}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Item fields</CardTitle>
          <CardDescription>Changes are saved immediately after you submit.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminEditItemForm
            item={{
              id: item.id,
              title: item.title,
              description: item.description,
              category: item.category,
              location: item.location,
              date: dateStr,
              type: item.type,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
