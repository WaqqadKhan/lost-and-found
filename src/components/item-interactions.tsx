"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Copy, Check, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { submitClaim, type ClaimFormState } from "@/app/actions/community";
import { cn } from "@/lib/utils";
import { scaleIn, defaultTransition } from "@/lib/motion";

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
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 1300);
      }}
    >
      {copied ? <Check className="mr-1 size-4" /> : <Copy className="mr-1 size-4" />}
      {copied ? "Copied!" : "Copy Link"}
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  if (!images.length) return null;

  return (
    <>
      <div className="space-y-2">
        <button
          type="button"
          className="group relative block w-full overflow-hidden rounded-xl border"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open image in lightbox"
        >
          <img src={active} alt={fallbackAlt} className="h-80 w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <ZoomIn className="size-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
        </button>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(img)}
              aria-label="View image thumbnail"
              aria-current={active === img ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-md border-2 transition-colors",
                active === img ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <img src={img} alt="" className="size-16 rounded-md object-cover" />
            </button>
          ))}
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-4xl" showCloseButton>
          <AnimatePresence mode="wait">
            <motion.img
              key={active}
              src={active}
              alt={fallbackAlt}
              className="max-h-[80vh] w-full rounded-xl object-contain"
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              variants={scaleIn}
              transition={defaultTransition}
            />
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ClaimFormInner({
  itemId,
  itemType,
  verificationQuestion,
  onSuccess,
}: {
  itemId: string;
  itemType: "lost" | "found";
  verificationQuestion: string | null;
  onSuccess?: () => void;
}) {
  const [state, action] = useFormState(submitClaim, initialClaim);
  const messagePlaceholder =
    itemType === "found"
      ? "Describe the item to prove ownership (color, contents, distinguishing marks)"
      : "Describe where and when you found it, and any details about the item";

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onSuccess?.();
    }
  }, [state?.success, onSuccess]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="itemId" value={itemId} />
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Textarea name="message" required placeholder={messagePlaceholder} rows={4} />
      {itemType === "found" && verificationQuestion ? (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verification</p>
          <p className="text-sm">{verificationQuestion}</p>
          <Input name="verificationAnswer" placeholder="Your answer" required />
        </div>
      ) : null}
      <Button type="submit" className="w-full sm:w-auto">
        Submit Claim
      </Button>
    </form>
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
  const ctaLabel = itemType === "found" ? "This is Mine" : "I Found This";

  return (
    <>
      <div className="hidden sm:block">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button type="button">{ctaLabel}</Button>} />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{ctaLabel}</DialogTitle>
              <DialogDescription>
                Submit a claim with details to help the owner verify. Your contact info is shared only after a match is
                confirmed.
              </DialogDescription>
            </DialogHeader>
            <ClaimFormInner
              itemId={itemId}
              itemType={itemType}
              verificationQuestion={verificationQuestion}
              onSuccess={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 p-4 backdrop-blur sm:hidden">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button type="button" className="w-full">{ctaLabel}</Button>} />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{ctaLabel}</DialogTitle>
              <DialogDescription>Submit a claim with details to help verify ownership.</DialogDescription>
            </DialogHeader>
            <ClaimFormInner
              itemId={itemId}
              itemType={itemType}
              verificationQuestion={verificationQuestion}
              onSuccess={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
