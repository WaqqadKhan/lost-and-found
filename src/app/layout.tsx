import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth/next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Lost & Found",
  description: "Report and recover lost items on campus.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  let pendingReviewCount = 0;
  let unreadNotificationCount = 0;

  if (session?.user?.id) {
    unreadNotificationCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    });
  }
  if (session?.user?.role === "admin") {
    pendingReviewCount = await prisma.item.count({
      where: { status: "pending" },
    });
  }

  return (
    <html lang="en" className={cn(inter.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers
          session={session}
          pendingReviewCount={pendingReviewCount}
          unreadNotificationCount={unreadNotificationCount}
        >
          <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t bg-muted/40">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-muted-foreground">
              <p>Lost &amp; Found — University Name</p>
              <p>Built for [Department] FYP 2026</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
