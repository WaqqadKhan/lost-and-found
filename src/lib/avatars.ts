export function getInitials(name: string) {
  const clean = name.trim();
  if (!clean) return "U";
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export function avatarColorClass(name: string) {
  const first = (name.trim()[0] || "U").toUpperCase();
  if (first >= "A" && first <= "E") return "bg-blue-500 text-white";
  if (first >= "F" && first <= "J") return "bg-green-500 text-white";
  if (first >= "K" && first <= "O") return "bg-orange-500 text-white";
  if (first >= "P" && first <= "T") return "bg-purple-500 text-white";
  return "bg-red-500 text-white";
}
