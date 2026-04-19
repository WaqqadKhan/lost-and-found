"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { markItemReturnedWithStory } from "@/app/actions/items";
import { Textarea } from "@/components/ui/textarea";

const initial = { error: null as string | null, success: null as string | null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Share Story"}
    </Button>
  );
}

export function ReturnItemDialog({ itemId }: { itemId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useFormState(markItemReturnedWithStory, initial);

  useEffect(() => {
    if (state?.success) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.7 },
      });
      setTimeout(() => setOpen(false), 1200);
    }
  }, [state?.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="secondary" size="sm" />}>Mark returned</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Congratulations! Your item was recovered!</DialogTitle>
          <DialogDescription>Want to share your story?</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-3">
          <input type="hidden" name="id" value={itemId} />
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state?.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
          <Textarea
            name="story"
            placeholder="Thanks to the finder who returned my laptop!"
          />
          <div className="flex gap-2">
            <SubmitButton />
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Skip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
