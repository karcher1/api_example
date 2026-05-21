import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import type { NavNode } from "@/lib/openapi";
import { slugify } from "@/lib/openapi";

export type ArticleBlockType = "note" | "info" | "warning" | "danger" | "tip" | "code" | "image" | string;

export interface ArticleBlock {
  id: string;
  type: ArticleBlockType;
  title?: string;
  content?: string;
  language?: string;
  code?: string;
  src?: string;
  alt?: string;
  caption?: string;
}

export interface ContentPage {
  slug: string;
  href: string;
  title: string;
  description?: string;
  body: string;
  blocks: ArticleBlock[];
}

type UnknownRecord = Record<string, unknown>;

const ARTICLES_ROOT = path.join(process.cwd(), "content", "articles");
const ARTICLES_NAVIGATION_PATH = path.join(ARTICLES_ROOT, "navigation.yaml");
const ARTICLES_PAGES_DIR = path.join(ARTICLES_ROOT, "pages");
const PUBLIC_ROOT = path.join(process.cwd(), "public");

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function readYamlObject(filePath: string, label: string): UnknownRecord {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} was not found at ${filePath}.`);
  }

  const file = fs.readFileSync(filePath, "utf8");
  const parsed = parse(file);

  if (!isRecord(parsed)) {
    throw new Error(`${label} must be a YAML object at ${filePath}.`);
  }

  return parsed;
}

function contentError(filePath: string, message: string): never {
  throw new Error(`Invalid article content at ${filePath}: ${message}`);
}

function navError(message: string): never {
  throw new Error(`Invalid article navigation at ${ARTICLES_NAVIGATION_PATH}: ${message}`);
}

function fileSlug(filePath: string): string {
  return path.basename(filePath).replace(/\.ya?ml$/i, "");
}

function validateSlugMatchesFile(slug: string, filePath: string) {
  const expected = fileSlug(filePath);

  if (slug !== expected) {
    contentError(filePath, `slug "${slug}" must match filename "${expected}".`);
  }
}

function requireString(record: UnknownRecord, field: string, filePath: string): string {
  const value = asString(record[field]).trim();

  if (!value) {
    contentError(filePath, `${field} is required and must be a non-empty string.`);
  }

  return value;
}

function optionalString(record: UnknownRecord, field: string): string | undefined {
  const value = asString(record[field]).trim();

  return value || undefined;
}

function ensureArray(value: unknown, field: string, filePath: string): unknown[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    contentError(filePath, `${field} must be an array when provided.`);
  }

  return value;
}

function validateLocalImageSrc(src: string, filePath: string, location: string) {
  if (/^[a-z][a-z\d+.-]*:/i.test(src) || src.startsWith("//")) {
    return;
  }

  if (!src.startsWith("/")) {
    contentError(filePath, `${location}.src references local image "${src}". Use an absolute public path like /images/example.png.`);
  }

  const publicPath = path.normalize(path.join(PUBLIC_ROOT, src.replace(/^\/+/, "")));
  const publicRootWithSeparator = `${PUBLIC_ROOT}${path.sep}`;

  if (publicPath !== PUBLIC_ROOT && !publicPath.startsWith(publicRootWithSeparator)) {
    contentError(filePath, `${location}.src must stay inside the public directory.`);
  }

  if (!fs.existsSync(publicPath)) {
    contentError(
      filePath,
      `${location}.src references missing public asset "${src}" (expected ${publicPath}).`,
    );
  }
}

function validateMarkdownLocalImageSrcs(source: string | undefined, filePath: string, location: string) {
  if (!source) {
    return;
  }

  const imagePattern = /!\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  let match: RegExpExecArray | null;

  while ((match = imagePattern.exec(source)) !== null) {
    validateLocalImageSrc(match[1] ?? "", filePath, `${location} Markdown image`);
  }
}

function articleFilePaths(): string[] {
  if (!fs.existsSync(ARTICLES_PAGES_DIR)) {
    throw new Error(`Article pages directory was not found at ${ARTICLES_PAGES_DIR}.`);
  }

  return fs
    .readdirSync(ARTICLES_PAGES_DIR)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .sort()
    .map((file) => path.join(ARTICLES_PAGES_DIR, file));
}

function parseBlocks(value: unknown, filePath: string): ArticleBlock[] {
  return ensureArray(value, "blocks", filePath).map((blockValue, index) => {
    if (!isRecord(blockValue)) {
      contentError(filePath, `blocks[${index}] must be an object.`);
    }

    const type = requireString(blockValue, "type", filePath);
    const title = optionalString(blockValue, "title");
    const content = optionalString(blockValue, "content");
    const code = optionalString(blockValue, "code");
    const src = optionalString(blockValue, "src");

    if (["note", "info", "warning", "danger", "tip"].includes(type) && !content) {
      contentError(filePath, `blocks[${index}].content is required for ${type} blocks.`);
    }

    if (type === "code" && !code) {
      contentError(filePath, `blocks[${index}].code is required for code blocks.`);
    }

    if (type === "image" && !src) {
      contentError(filePath, `blocks[${index}].src is required for image blocks.`);
    }

    if (type === "image" && src) {
      validateLocalImageSrc(src, filePath, `blocks[${index}]`);
    }

    validateMarkdownLocalImageSrcs(content, filePath, `blocks[${index}].content`);

    return {
      id: slugify(title || `${type}-${index + 1}`),
      type,
      title,
      content,
      language: optionalString(blockValue, "language"),
      code,
      src,
      alt: optionalString(blockValue, "alt"),
      caption: optionalString(blockValue, "caption"),
    };
  });
}

function pageFromFile(filePath: string): ContentPage {
  const document = readYamlObject(filePath, "Article file");
  const slug = requireString(document, "slug", filePath);
  const title = requireString(document, "title", filePath);
  const body = requireString(document, "content", filePath);

  validateSlugMatchesFile(slug, filePath);
  validateMarkdownLocalImageSrcs(body, filePath, "content");

  return {
    slug,
    href: `/docs/${slug}`,
    title,
    description: optionalString(document, "description"),
    body,
    blocks: parseBlocks(document.blocks, filePath),
  };
}

export function getContentPages(): ContentPage[] {
  const seen = new Map<string, string>();
  const pages: ContentPage[] = [];

  articleFilePaths().forEach((filePath) => {
    const page = pageFromFile(filePath);
    const existing = seen.get(page.slug);

    if (existing) {
      throw new Error(`Duplicate article slug "${page.slug}" in ${existing} and ${filePath}.`);
    }

    seen.set(page.slug, filePath);
    pages.push(page);
  });

  return pages;
}

export function getContentPage(slug: string): ContentPage | undefined {
  return getContentPages().find((page) => page.slug === slug);
}

export function getContentPageStaticParams(): Array<{ slug: string }> {
  return getContentPages().map((page) => ({ slug: page.slug }));
}

export function getLegacyContentPageStaticParams(): Array<{ page: string }> {
  return getContentPages().map((page) => ({ page: page.slug }));
}

function readNavigationDocument(): UnknownRecord {
  const document = readYamlObject(ARTICLES_NAVIGATION_PATH, "Article navigation file");

  if (!Array.isArray(document.sections)) {
    navError("sections must be an array.");
  }

  if (document.sections.length === 0) {
    navError("sections must contain at least one section.");
  }

  return document;
}

function pagesBySlug(pages: ContentPage[]): Map<string, ContentPage> {
  return new Map(pages.map((page) => [page.slug, page]));
}

function articleNavNode(page: ContentPage, label?: string): NavNode {
  return {
    id: `article:${page.slug}`,
    type: "endpoint",
    label: label || page.title,
    href: page.href,
    children: [],
  };
}

function parseNavItems(
  value: unknown,
  pageBySlug: Map<string, ContentPage>,
  placedSlugs: Set<string>,
  groupIds: Set<string>,
  location: string,
): NavNode[] {
  if (!Array.isArray(value)) {
    navError(`${location} must be an array.`);
  }

  if (value.length === 0) {
    navError(`${location} must contain at least one item.`);
  }

  return value.map((itemValue, index) => {
    const itemLocation = `${location}[${index}]`;

    if (!isRecord(itemValue)) {
      navError(`${itemLocation} must be an object.`);
    }

    const slug = asString(itemValue.slug).trim();

    if (slug) {
      if (itemValue.items !== undefined) {
        navError(`${itemLocation} cannot define both slug and items.`);
      }

      const page = pageBySlug.get(slug);

      if (!page) {
        navError(`${itemLocation}.slug references missing article "${slug}".`);
      }

      if (placedSlugs.has(slug)) {
        navError(`Article slug "${slug}" is listed more than once in navigation.`);
      }

      placedSlugs.add(slug);

      return articleNavNode(page, optionalString(itemValue, "title"));
    }

    const id = requireString(itemValue, "id", ARTICLES_NAVIGATION_PATH);
    const label = requireString(itemValue, "title", ARTICLES_NAVIGATION_PATH);

    if (groupIds.has(id)) {
      navError(`Group id "${id}" is used more than once.`);
    }

    groupIds.add(id);

    return {
      id,
      type: "group",
      label,
      defaultOpen: itemValue.defaultOpen !== false,
      children: parseNavItems(itemValue.items, pageBySlug, placedSlugs, groupIds, `${itemLocation}.items`),
    };
  });
}

function firstPageInNavigation(nodes: NavNode[]): NavNode | undefined {
  for (const node of nodes) {
    if (node.type === "endpoint") {
      return node;
    }

    const child = firstPageInNavigation(node.children);

    if (child) {
      return child;
    }
  }

  return undefined;
}

export function getContentNavigationTitle(): string {
  const document = readNavigationDocument();
  const title = optionalString(document, "title");

  return title ?? "Articles";
}

export function getContentNavigation(): NavNode[] {
  const pages = getContentPages();
  const document = readNavigationDocument();
  const placedSlugs = new Set<string>();
  const groupIds = new Set<string>();

  return parseNavItems(document.sections, pagesBySlug(pages), placedSlugs, groupIds, "sections");
}

export function getFirstContentPageHref(): string {
  const navigationFirst = firstPageInNavigation(getContentNavigation());

  if (navigationFirst?.href) {
    return navigationFirst.href;
  }

  const page = getContentPages()[0];

  return page?.href ?? "/";
}
