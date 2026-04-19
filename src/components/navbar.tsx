"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Bell } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar({
  pendingReviewCount = 0,
  unreadNotificationCount = 0,
}: {
  pendingReviewCount?: number;
  unreadNotificationCount?: number;
}) {
  const { data: session, status } = useSession();

  const linkClass = (extra?: string) =>
    cn(buttonVariants({ variant: "ghost", size: "sm" }), extra);

  const badgeClass =
    "absolute -top-2 -right-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white";

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Lost &amp; Found
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className={linkClass()}>
            Home
          </Link>
          <Link href="/search" className={linkClass()}>
            Search
          </Link>
          {status === "loading" ? null : session ? (
            <>
              <Link href="/dashboard" className={linkClass()}>
                Dashboard
              </Link>
              <Link
                href="/dashboard/notifications"
                className={cn(linkClass(), "relative inline-flex items-center justify-center")}
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                {unreadNotificationCount > 0 ? (
                  <span className={badgeClass} aria-hidden>
                    {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                  </span>
                ) : null}
              </Link>
              {session.user.role === "admin" ? (
                <Link href="/admin" className={cn(linkClass(), "relative")}>
                  Admin
                  {pendingReviewCount > 0 ? (
                    <span className={badgeClass} aria-hidden>
                      {pendingReviewCount > 9 ? "9+" : pendingReviewCount}
                    </span>
                  ) : null}
                </Link>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass()}>
                Login
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: "default", size: "sm" }))}
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
