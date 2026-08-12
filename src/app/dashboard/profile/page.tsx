import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ProfileForm } from "@/components/profile-form";
import { CanvasSettingsForm } from "@/components/canvas-settings-form";
import { getSiteCanvasSettings } from "@/lib/site-settings";
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

  const isAdmin = session.user.role === "admin";
  const canvas = isAdmin ? await getSiteCanvasSettings() : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your email stays the same for security. Update your display name and phone for listings.
        </p>
      </div>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>Changes apply to new and existing listings you posted.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultName={user.name}
            email={user.email}
            defaultPhone={user.phone ?? ""}
            isAdmin={isAdmin}
            defaultAutoApprove={user.autoApprove}
          />
        </CardContent>
      </Card>

      {isAdmin && canvas ? (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Site canvas</CardTitle>
            <CardDescription>
              Choose a solid color or multi-color gradient for the page background. This applies to every account —
              students and admins alike. Content panels stay high-contrast for readability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CanvasSettingsForm defaults={canvas} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
