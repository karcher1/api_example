import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface ContentPage {
  slug: string;
  title: string;
  description?: string;
  body: string;
}

const PAGES_DIR = path.join(process.cwd(), "content", "pages");
const PAGE_ORDER = ["guides", "manager-guide", "authentication", "errors", "changelog"];

function pageTitleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getContentPages(): ContentPage[] {
  if (!fs.existsSync(PAGES_DIR)) {
    return [];
  }

  return fs
    .readdirSync(PAGES_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const source = fs.readFileSync(path.join(PAGES_DIR, file), "utf8");
      const parsed = matter(source);

      return {
        slug,
        title: typeof parsed.data.title === "string" ? parsed.data.title : pageTitleFromSlug(slug),
        description:
          typeof parsed.data.description === "string" ? parsed.data.description : undefined,
        body: parsed.content,
      };
    })
    .sort((a, b) => {
      const aIndex = PAGE_ORDER.indexOf(a.slug);
      const bIndex = PAGE_ORDER.indexOf(b.slug);

      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
          (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
      }

      return a.title.localeCompare(b.title);
    });
}

export function getContentPage(slug: string): ContentPage | undefined {
  return getContentPages().find((page) => page.slug === slug);
}

export function getContentPageStaticParams(): Array<{ page: string }> {
  return getContentPages().map((page) => ({ page: page.slug }));
}
