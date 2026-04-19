"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateProfile, type ProfileFormState } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

const initial: ProfileFormState = { error: null, success: null };

export function ProfileForm({
  defaultName,
  email,
  defaultPhone,
  isAdmin,
  defaultAutoApprove,
}: {
  defaultName: string;
  email: string;
  defaultPhone: string;
  isAdmin: boolean;
  defaultAutoApprove: boolean;
}) {
  const [state, formAction] = useFormState(updateProfile, initial);

  return (
    <form action={formAction} className="mx-auto max-w-md space-y-4">
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      {state?.success ? (
        <p className="text-sm text-emerald-700" role="status">
          {state.success}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={defaultName} required autoComplete="name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" value={email} readOnly disabled className="opacity-80" />
        <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number (optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={defaultPhone}
          autoComplete="tel"
        />
      </div>

      {isAdmin ? (
        <div className="rounded-lg border p-3">
          <label htmlFor="autoApprove" className="flex items-start gap-2 text-sm">
            <input
              id="autoApprove"
              name="autoApprove"
              type="checkbox"
              defaultChecked={defaultAutoApprove}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">Auto approve new listings</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                When enabled, new submissions are automatically approved.
              </span>
            </span>
          </label>
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}
