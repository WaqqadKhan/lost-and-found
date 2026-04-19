"use client";

import { markItemResolvedWithoutClaim } from "@/app/actions/items";
import { Button } from "@/components/ui/button";

export function ResolvedWithoutClaimForm({ itemId }: { itemId: string }) {
  return (
    <form
      action={markItemResolvedWithoutClaim}
      onSubmit={(e) => {
        const ok = window.confirm(
          "Mark this item as returned without a claim? This will close all pending claims.",
        );
        if (!ok) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={itemId} />
      <Button type="submit" variant="secondary" size="sm">
        Resolved without claim
      </Button>
    </form>
  );
}
