import { format, formatDistanceToNow, isPast, differenceInDays, parseISO } from "date-fns";

export function formatDate(d?: string | null) {
  if (!d) return "—";
  try {
    return format(parseISO(d), "MMM d, yyyy");
  } catch {
    return d;
  }
}

export function formatRelative(d?: string | null) {
  if (!d) return "—";
  try {
    return formatDistanceToNow(parseISO(d), { addSuffix: true });
  } catch {
    return d;
  }
}

export function isOverdue(due?: string | null, status?: string) {
  if (!due || status === "DONE") return false;
  try {
    return isPast(parseISO(due));
  } catch {
    return false;
  }
}

export function isDueSoon(due?: string | null, status?: string) {
  if (!due || status === "DONE") return false;
  try {
    const days = differenceInDays(parseISO(due), new Date());
    return days >= 0 && days <= 3;
  } catch {
    return false;
  }
}

export function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
