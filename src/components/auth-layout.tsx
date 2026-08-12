import Link from "next/link";
import { cn } from "@/lib/utils";

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2 lg:items-center">
      <div className="hidden space-y-4 lg:block">
        <p className="text-overline uppercase text-muted-foreground">IIUI Islamabad</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Campus Lost &amp; Found</h1>
        <p className="text-muted-foreground">
          Report lost items, browse found listings, and reconnect with your belongings — all in one trusted campus
          platform.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Admin-moderated listings
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Secure claim verification
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Contact shared only after match
          </li>
        </ul>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-card sm:p-8">
          <div className="mb-6 space-y-1">
            <h2 className="font-heading text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
        {footer}
      </div>
    </div>
  );
}

export function AuthFooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div className="text-center text-sm text-muted-foreground">
      <Link href={href} className={cn("text-primary underline-offset-4 hover:underline")}>
        {children}
      </Link>
    </div>
  );
}
