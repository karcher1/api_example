import type { ContentPage } from "@/lib/pages";

export function bodyWithoutDuplicateTitle(page: ContentPage): string {
  const normalizedTitle = page.title.trim().toLowerCase();
  const lines = page.body.replace(/\r\n/g, "\n").split("\n");
  const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);

  if (firstContentIndex === -1) {
    return page.body;
  }

  const firstLine = lines[firstContentIndex].trim();

  if (!firstLine.startsWith("# ")) {
    return page.body;
  }

  const heading = firstLine.slice(2).trim().toLowerCase();

  if (heading !== normalizedTitle) {
    return page.body;
  }

  return [...lines.slice(0, firstContentIndex), ...lines.slice(firstContentIndex + 1)].join("\n").trimStart();
}
