"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell, Menu, Search, Shield } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/stories", label: "Stories" },
];

export function Navbar({
  pendingReviewCount = 0,
  unreadNotificationCount = 0,
}: {
  pendingReviewCount?: number;
  unreadNotificationCount?: number;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const linkClass = (href: string, extra?: string) =>
    cn(
      buttonVariants({ variant: "ghost", size: "sm" }),
      pathname === href || (href !== "/" && pathname.startsWith(href))
        ? "bg-accent text-accent-foreground"
        : "",
      extra,
    );

  const badgeClass =
    "absolute -top-2 -right-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground";

  const authLinks = session ? (
    <>
      <Link href="/dashboard" className={linkClass("/dashboard")}>
        Dashboard
      </Link>
      <Link
        href="/dashboard/notifications"
        className={cn(linkClass("/dashboard/notifications"), "relative inline-flex items-center justify-center")}
        aria-label={
          unreadNotificationCount > 0
            ? `Notifications, ${unreadNotificationCount} unread`
            : "Notifications"
        }
      >
        <Bell className="size-4" />
        {unreadNotificationCount > 0 ? (
          <span className={badgeClass} aria-hidden>
            {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
          </span>
        ) : null}
      </Link>
      {session.user.role === "admin" ? (
        <Link href="/admin" className={cn(linkClass("/admin"), "relative gap-1.5")}>
          <Shield className="size-3.5" />
          Admin
          {pendingReviewCount > 0 ? (
            <span className={badgeClass} aria-hidden>
              {pendingReviewCount > 9 ? "9+" : pendingReviewCount}
            </span>
          ) : null}
        </Link>
      ) : null}
      <Link href="/dashboard/profile" className={cn(linkClass("/dashboard/profile"), "gap-2")}>
        <UserAvatar name={session.user.name || "User"} className="size-6 text-[10px]" />
        <span className="hidden sm:inline">{session.user.name?.split(" ")[0] || "Profile"}</span>
      </Link>
      <Button variant="outline" size="sm" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
        Logout
      </Button>
    </>
  ) : (
    <>
      <Link href="/login" className={linkClass("/login")}>
        Login
      </Link>
      <Link href="/register" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
        Register
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-[var(--navbar-bg,var(--card))] backdrop-blur supports-[backdrop-filter]:bg-[var(--navbar-bg,var(--card))]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
            LF
          </span>
          <span className="hidden sm:inline">Lost &amp; Found</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Main navigation">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
          {status === "loading" ? null : authLinks}
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <Link href="/search" className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))} aria-label="Search">
            <Search className="size-4" />
          </Link>
          <Sheet>
          <SheetTrigger
            render={<Button variant="outline" size="icon-sm" aria-label="Open menu" />}
          >
            <Menu className="size-4" />
          </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile navigation">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href} className={linkClass(l.href, "justify-start")}>
                    {l.label}
                  </Link>
                ))}
                {status === "loading" ? null : (
                  <div className="mt-2 flex flex-col gap-1 border-t pt-4">{authLinks}</div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
