import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { getServerSession } from "next-auth/next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Providers } from "@/components/providers";
import { getSiteCanvasSettings } from "@/lib/site-settings";
import { buildCanvasCssVars } from "@/lib/canvas";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lost & Found — IIUI Islamabad",
  description: "Report and recover lost items on campus.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  const [canvas, unreadNotificationCount, pendingReviewCount] = await Promise.all([
    getSiteCanvasSettings(),
    session?.user?.id
      ? prisma.notification.count({
          where: { userId: session.user.id, read: false },
        })
      : Promise.resolve(0),
    session?.user?.role === "admin"
      ? prisma.item.count({ where: { status: "pending" } })
      : Promise.resolve(0),
  ]);

  const canvasVars = buildCanvasCssVars(canvas);

  return (
    <html lang="en" className={cn(inter.variable, plusJakarta.variable)}>
      <body
        className="min-h-screen font-sans antialiased"
        style={
          {
            ...canvasVars,
            background: "var(--page-canvas)",
            backgroundAttachment: "fixed",
          } as CSSProperties
        }
      >
        <Providers
          session={session}
          pendingReviewCount={pendingReviewCount}
          unreadNotificationCount={unreadNotificationCount}
        >
          <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8">
            {children}
          </main>
          <footer className="border-t bg-[var(--footer-bg,var(--muted))]">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-muted-foreground">
              <p>Lost &amp; Found — IIUI Islamabad</p>
              <p>Built for Department of IT FYP 2026</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
