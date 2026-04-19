"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { Navbar } from "@/components/navbar";

export function Providers({
  children,
  session,
  pendingReviewCount,
  unreadNotificationCount,
}: {
  children: React.ReactNode;
  session: Session | null;
  pendingReviewCount: number;
  unreadNotificationCount: number;
}) {
  return (
    <SessionProvider session={session}>
      <Navbar
        pendingReviewCount={pendingReviewCount}
        unreadNotificationCount={unreadNotificationCount}
      />
      {children}
    </SessionProvider>
  );
}
