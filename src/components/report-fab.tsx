"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReportFab() {
  const { data: session } = useSession();
  if (!session) return null;

  return (
    <Link
      href="/dashboard/add"
      className={cn(
        buttonVariants({ size: "icon-lg" }),
        "fixed bottom-5 right-5 z-30 rounded-full shadow-lg md:hidden",
      )}
      aria-label="Report an item"
    >
      <Plus className="size-5" />
    </Link>
  );
}
