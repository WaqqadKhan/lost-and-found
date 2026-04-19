"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitClaim, type ClaimFormState } from "@/app/actions/community";
import { cn } from "@/lib/utils";

const initialClaim: ClaimFormState = { error: null, success: null };

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1300);
      }}
    >
      {copied ? <Check className="mr-1 size-4" /> : <Copy className="mr-1 size-4" />}
      {copied ? "Link copied!" : "Copy Link"}
    </Button>
  );
}

export function ItemImageGallery({
  images,
  fallbackAlt,
}: {
  images: string[];
  fallbackAlt: string;
}) {
  const [active, setActive] = useState(images[0] || "");
  if (!images.length) return null;
  return (
    <div className="space-y-2">
      <img src={active} alt={fallbackAlt} className="h-80 w-full rounded-xl border object-cover" />
      <div className="flex gap-2 overflow-x-auto">
        {images.map((img) => (
          <button
            key={img}
            type="button"
            onClick={() => setActive(img)}
            className={cn("rounded-md border", active === img ? "ring-2 ring-primary" : "")}
          >
            <img src={img} alt="" className="size-16 rounded-md object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ClaimForm({
  itemId,
  itemType,
  verificationQuestion,
}: {
  itemId: string;
  itemType: "lost" | "found";
  verificationQuestion: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useFormState(submitClaim, initialClaim);
  const ctaLabel = itemType === "found" ? "This is Mine" : "I Found This";
  const messagePlaceholder =
    itemType === "found"
      ? "Describe the item to prove ownership (color, contents, distinguishing marks)"
      : "Describe where and when you found it, and any details about the item";
  return (
    <div className="space-y-3">
      <Button type="button" onClick={() => setOpen((v) => !v)}>
        {ctaLabel}
      </Button>
      {open ? (
        <form action={action} className="space-y-2 rounded-lg border p-3">
          <input type="hidden" name="itemId" value={itemId} />
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state?.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
          <Textarea
            name="message"
            required
            placeholder={messagePlaceholder}
          />
          {itemType === "found" && verificationQuestion ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Verification question</p>
              <p className="text-sm">{verificationQuestion}</p>
              <Input name="verificationAnswer" placeholder="Your answer" />
            </div>
          ) : null}
          <Button type="submit" size="sm">
            Submit Claim
          </Button>
        </form>
      ) : null}
    </div>
  );
}
