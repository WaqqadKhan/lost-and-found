"use client";

import { markItemReturnedAdmin } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

export function AdminMarkReturnedForm({ itemId }: { itemId: string }) {
  return (
    <form
      action={markItemReturnedAdmin}
      onSubmit={(e) => {
        const ok = window.confirm("Mark this item as returned? This will close all pending claims.");
        if (!ok) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={itemId} />
      <Button type="submit" variant="secondary" size="sm">
        Mark as returned
      </Button>
    </form>
  );
}
