import { avatarColorClass, getInitials } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export function UserAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full text-xs font-semibold",
        avatarColorClass(name),
        className,
      )}
      aria-hidden
      title={name}
    >
      {getInitials(name)}
    </span>
  );
}
