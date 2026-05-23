import { slugify } from "@/lib/openapi";

export function markdownPlainText(value: string): string {
  return value
    .replace(/!\[([^\]]*)]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

export function createHeadingIdTracker() {
  const counts = new Map<string, number>();

  return (value: string): string => {
    const baseId = slugify(markdownPlainText(value));
    const nextCount = (counts.get(baseId) ?? 0) + 1;

    counts.set(baseId, nextCount);

    return nextCount === 1 ? baseId : `${baseId}-${nextCount}`;
  };
}
