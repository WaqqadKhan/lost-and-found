import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Mail, Phone, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { findPossibleMatches } from "@/lib/matching";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge, TypeBadge } from "@/components/badges";
import { ItemCard } from "@/components/item-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { name: true, email: true, phone: true },
      },
    },
  });

  if (!item) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.id === item.userId;
  const isAdmin = session?.user?.role === "admin";
  const canView = item.status === "approved" || isOwner || isAdmin;

  if (!canView) {
    notFound();
  }

  const matches = await findPossibleMatches(
    item.id,
    item.title,
    item.category,
    item.location,
    item.type,
  );

  const when = new Date(item.date).toLocaleDateString();

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No photo provided
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <TypeBadge type={item.type} />
            <StatusBadge status={item.status} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>
            <p className="text-sm text-muted-foreground">
              {item.category} · {item.location} · {when}
            </p>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.description}</p>

          <Card className="border-2 border-primary/20 bg-muted/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Contact information</CardTitle>
              <CardDescription>
                Reach out to the poster directly. Email and phone are verified at post time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3 rounded-lg border bg-background/80 p-3">
                <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Name
                  </p>
                  <p className="font-medium">{item.user.name}</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border bg-background/80 p-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>
                  {item.user.email ? (
                    <a
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      href={`mailto:${item.user.email}`}
                    >
                      {item.user.email}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">No email on file</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border bg-background/80 p-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Phone
                  </p>
                  {item.user.phone ? (
                    <a
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      href={`tel:${item.user.phone}`}
                    >
                      {item.user.phone}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">No phone provided</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/search" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Back to search
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Possible matches</h2>
          <p className="text-sm text-muted-foreground">
            Opposite-type listings that share the same category and location, or overlap on title
            keywords (excluding common words).
          </p>
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No strong matches yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((m) => (
              <ItemCard key={m.id} item={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
