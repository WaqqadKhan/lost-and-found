import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ProfileForm } from "@/components/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, autoApprove: true },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your email stays the same for security. Update your display name and phone for listings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>Changes apply to new and existing listings you posted.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultName={user.name}
            email={user.email}
            defaultPhone={user.phone ?? ""}
            isAdmin={session.user.role === "admin"}
            defaultAutoApprove={user.autoApprove}
          />
        </CardContent>
      </Card>
    </div>
  );
}
