"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveSuccessStory, type SuccessStoryFormState } from "@/app/actions/items";

const initial: SuccessStoryFormState = { error: null, success: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Share story"}
    </Button>
  );
}

export function SuccessStoryPromptDialog({
  itemId,
  defaultOpen,
}: {
  itemId: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [state, action] = useFormState(saveSuccessStory, initial);

  useEffect(() => {
    if (state?.success) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
      setTimeout(() => setOpen(false), 900);
    }
  }, [state?.success]);

  if (!defaultOpen) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share your reunion story</DialogTitle>
          <DialogDescription>
            You recovered the lost side of this reunion — a short note helps the community celebrate wins.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-3">
          <input type="hidden" name="itemId" value={itemId} />
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state?.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
          <Textarea name="message" placeholder="What happened? How did you get your item back?" />
          <div className="flex gap-2">
            <SubmitButton />
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Not now
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
