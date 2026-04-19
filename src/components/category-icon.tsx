import {
  Briefcase,
  FileText,
  KeyRound,
  Laptop,
  Package,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react";

function iconForCategory(category: string): LucideIcon {
  const c = category.toLowerCase();
  if (c === "wallet") return Wallet;
  if (c === "phone") return Smartphone;
  if (c === "keys") return KeyRound;
  if (c === "documents") return FileText;
  if (c === "bag") return Briefcase;
  if (c === "electronics") return Laptop;
  return Package;
}

export function CategoryIcon({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  const Icon = iconForCategory(category);
  return <Icon className={className} aria-hidden />;
}
