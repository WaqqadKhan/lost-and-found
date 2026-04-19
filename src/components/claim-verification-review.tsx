import { cn } from "@/lib/utils";

/** Shown to poster/admin when reviewing claims on a *found* listing (optional verification). */
export function ClaimVerificationReview({
  itemType,
  listingQuestion,
  claimantAnswer,
  matched,
}: {
  itemType: string;
  listingQuestion: string | null;
  claimantAnswer: string | null;
  matched: boolean;
}) {
  if (itemType !== "found") return null;
  if (!listingQuestion && !claimantAnswer) return null;

  return (
    <div className="rounded-md border bg-muted/30 p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verification</p>
      {listingQuestion ? (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted-foreground">Question on this listing</p>
          <p className="whitespace-pre-wrap font-medium leading-relaxed">{listingQuestion}</p>
        </div>
      ) : null}
      <div className={cn("space-y-1", listingQuestion ? "mt-3" : "mt-2")}>
        <p className="text-xs text-muted-foreground">Claimant&apos;s answer</p>
        {claimantAnswer ? (
          <p className="whitespace-pre-wrap leading-relaxed">{claimantAnswer}</p>
        ) : (
          <p className="text-muted-foreground italic">No verification answer submitted</p>
        )}
      </div>
      {listingQuestion ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Automated check: {matched ? "matches the answer you saved when posting" : "does not match your saved answer"}
        </p>
      ) : null}
    </div>
  );
}
