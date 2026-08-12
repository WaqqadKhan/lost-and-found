"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { ReportFab } from "@/components/report-fab";
import { SideDecor } from "@/components/side-decor";
import { NavigationProgress } from "@/components/navigation-progress";

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
    <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
      <TooltipProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <SideDecor />
        <div className="relative z-10">
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <Navbar
            pendingReviewCount={pendingReviewCount}
            unreadNotificationCount={unreadNotificationCount}
          />
          {children}
          <ReportFab />
          <Toaster />
        </div>
      </TooltipProvider>
    </SessionProvider>
  );
}
