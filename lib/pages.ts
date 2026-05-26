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

const PUBLIC_ROOT = path.join(process.cwd(), "public");

interface ContentCollectionConfig {
  root: string;
  navigationPath: string;
  pagesDir: string;
  routeBase: string;
  defaultTitle: string;
  contentLabel: string;
  navigationLabel: string;
  itemLabel: string;
  nodePrefix: string;
}

function collectionConfig({
  dirName,
  routeBase,
  defaultTitle,
  contentLabel,
  navigationLabel,
  itemLabel,
  nodePrefix,
}: {
  dirName: string;
  routeBase: string;
  defaultTitle: string;
  contentLabel: string;
  navigationLabel: string;
  itemLabel: string;
  nodePrefix: string;
}): ContentCollectionConfig {
  const root = path.join(process.cwd(), "content", dirName);

  return {
    root,
    navigationPath: path.join(root, "navigation.yaml"),
    pagesDir: path.join(root, "pages"),
    routeBase,
    defaultTitle,
    contentLabel,
    navigationLabel,
    itemLabel,
    nodePrefix,
  };
}

const GUIDES_COLLECTION = collectionConfig({
  dirName: "guides",
  routeBase: "/guides",
  defaultTitle: "Guides",
  contentLabel: "guide content",
  navigationLabel: "guide navigation",
  itemLabel: "guide",
  nodePrefix: "guide",
});

const WEBHOOKS_COLLECTION = collectionConfig({
  dirName: "webhooks",
  routeBase: "/webhooks",
  defaultTitle: "Webhooks",
  contentLabel: "webhook content",
  navigationLabel: "webhook navigation",
  itemLabel: "webhook page",
  nodePrefix: "webhook",
});

const SDK_COLLECTION = collectionConfig({
  dirName: "sdk",
  routeBase: "/sdk",
  defaultTitle: "SDK",
  contentLabel: "SDK content",
  navigationLabel: "SDK navigation",
  itemLabel: "SDK page",
  nodePrefix: "sdk",
});

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

function contentError(collection: ContentCollectionConfig, filePath: string, message: string): never {
  throw new Error(`Invalid ${collection.contentLabel} at ${filePath}: ${message}`);
}

function navError(collection: ContentCollectionConfig, message: string): never {
  throw new Error(`Invalid ${collection.navigationLabel} at ${collection.navigationPath}: ${message}`);
}

function fileSlug(filePath: string): string {
  return path.basename(filePath).replace(/\.ya?ml$/i, "");
}

function validateSlugMatchesFile(collection: ContentCollectionConfig, slug: string, filePath: string) {
  const expected = fileSlug(filePath);

  if (slug !== expected) {
    contentError(collection, filePath, `slug "${slug}" must match filename "${expected}".`);
  }
}

function requireString(
  collection: ContentCollectionConfig,
  record: UnknownRecord,
  field: string,
  filePath: string,
): string {
  const value = asString(record[field]).trim();

  if (!value) {
    contentError(collection, filePath, `${field} is required and must be a non-empty string.`);
  }

  return value;
}

function optionalString(record: UnknownRecord, field: string): string | undefined {
  const value = asString(record[field]).trim();

  return value || undefined;
}

function ensureArray(
  collection: ContentCollectionConfig,
  value: unknown,
  field: string,
  filePath: string,
): unknown[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    contentError(collection, filePath, `${field} must be an array when provided.`);
  }

  return value;
}

function validateLocalImageSrc(
  collection: ContentCollectionConfig,
  src: string,
  filePath: string,
  location: string,
) {
  if (/^[a-z][a-z\d+.-]*:/i.test(src) || src.startsWith("//")) {
    return;
  }

  if (!src.startsWith("/")) {
    contentError(collection, filePath, `${location}.src references local image "${src}". Use an absolute public path like /images/example.png.`);
  }

  const publicPath = path.normalize(path.join(PUBLIC_ROOT, src.replace(/^\/+/, "")));
  const publicRootWithSeparator = `${PUBLIC_ROOT}${path.sep}`;

  if (publicPath !== PUBLIC_ROOT && !publicPath.startsWith(publicRootWithSeparator)) {
    contentError(collection, filePath, `${location}.src must stay inside the public directory.`);
  }

  if (!fs.existsSync(publicPath)) {
    contentError(
      collection,
      filePath,
      `${location}.src references missing public asset "${src}" (expected ${publicPath}).`,
    );
  }
}

function validateMarkdownLocalImageSrcs(
  collection: ContentCollectionConfig,
  source: string | undefined,
  filePath: string,
  location: string,
) {
  if (!source) {
    return;
  }

  const imagePattern = /!\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  let match: RegExpExecArray | null;

  while ((match = imagePattern.exec(source)) !== null) {
    validateLocalImageSrc(collection, match[1] ?? "", filePath, `${location} Markdown image`);
  }
}

function pageFilePaths(collection: ContentCollectionConfig): string[] {
  if (!fs.existsSync(collection.pagesDir)) {
    throw new Error(`${collection.defaultTitle} pages directory was not found at ${collection.pagesDir}.`);
  }

  return fs
    .readdirSync(collection.pagesDir)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .sort()
    .map((file) => path.join(collection.pagesDir, file));
}

function parseBlocks(collection: ContentCollectionConfig, value: unknown, filePath: string): ArticleBlock[] {
  return ensureArray(collection, value, "blocks", filePath).map((blockValue, index) => {
    if (!isRecord(blockValue)) {
      contentError(collection, filePath, `blocks[${index}] must be an object.`);
    }

    const type = requireString(collection, blockValue, "type", filePath);
    const title = optionalString(blockValue, "title");
    const content = optionalString(blockValue, "content");
    const code = optionalString(blockValue, "code");
    const src = optionalString(blockValue, "src");

    if (["note", "info", "warning", "danger", "tip"].includes(type) && !content) {
      contentError(collection, filePath, `blocks[${index}].content is required for ${type} blocks.`);
    }

    if (type === "code" && !code) {
      contentError(collection, filePath, `blocks[${index}].code is required for code blocks.`);
    }

    if (type === "image" && !src) {
      contentError(collection, filePath, `blocks[${index}].src is required for image blocks.`);
    }

    if (type === "image" && src) {
      validateLocalImageSrc(collection, src, filePath, `blocks[${index}]`);
    }

    validateMarkdownLocalImageSrcs(collection, content, filePath, `blocks[${index}].content`);

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

function pageFromFile(collection: ContentCollectionConfig, filePath: string): ContentPage {
  const document = readYamlObject(filePath, `${collection.defaultTitle} file`);
  const slug = requireString(collection, document, "slug", filePath);
  const title = requireString(collection, document, "title", filePath);
  const body = requireString(collection, document, "content", filePath);

  validateSlugMatchesFile(collection, slug, filePath);
  validateMarkdownLocalImageSrcs(collection, body, filePath, "content");

  return {
    slug,
    href: `${collection.routeBase}/${slug}`,
    title,
    description: optionalString(document, "description"),
    body,
    blocks: parseBlocks(collection, document.blocks, filePath),
  };
}

function getPages(collection: ContentCollectionConfig): ContentPage[] {
  const seen = new Map<string, string>();
  const pages: ContentPage[] = [];

  pageFilePaths(collection).forEach((filePath) => {
    const page = pageFromFile(collection, filePath);
    const existing = seen.get(page.slug);

    if (existing) {
      throw new Error(`Duplicate ${collection.itemLabel} slug "${page.slug}" in ${existing} and ${filePath}.`);
    }

    seen.set(page.slug, filePath);
    pages.push(page);
  });

  return pages;
}

export function getGuidePages(): ContentPage[] {
  return getPages(GUIDES_COLLECTION);
}

export function getGuidePage(slug: string): ContentPage | undefined {
  return getGuidePages().find((page) => page.slug === slug);
}

export function getGuidePageStaticParams(): Array<{ slug: string }> {
  return getGuidePages().map((page) => ({ slug: page.slug }));
}

export function getLegacyGuidePageStaticParams(): Array<{ page: string }> {
  return getGuidePages().map((page) => ({ page: page.slug }));
}

function readNavigationDocument(collection: ContentCollectionConfig): UnknownRecord {
  const document = readYamlObject(collection.navigationPath, `${collection.defaultTitle} navigation file`);

  if (!Array.isArray(document.sections)) {
    navError(collection, "sections must be an array.");
  }

  if (document.sections.length === 0) {
    navError(collection, "sections must contain at least one section.");
  }

  return document;
}

function pagesBySlug(pages: ContentPage[]): Map<string, ContentPage> {
  return new Map(pages.map((page) => [page.slug, page]));
}

function contentNavNode(collection: ContentCollectionConfig, page: ContentPage, label?: string): NavNode {
  return {
    id: `${collection.nodePrefix}:${page.slug}`,
    type: "endpoint",
    label: label || page.title,
    href: page.href,
    children: [],
  };
}

function parseNavItems(
  collection: ContentCollectionConfig,
  value: unknown,
  pageBySlug: Map<string, ContentPage>,
  placedSlugs: Set<string>,
  groupIds: Set<string>,
  location: string,
): NavNode[] {
  if (!Array.isArray(value)) {
    navError(collection, `${location} must be an array.`);
  }

  if (value.length === 0) {
    navError(collection, `${location} must contain at least one item.`);
  }

  return value.map((itemValue, index) => {
    const itemLocation = `${location}[${index}]`;

    if (!isRecord(itemValue)) {
      navError(collection, `${itemLocation} must be an object.`);
    }

    const slug = asString(itemValue.slug).trim();

    if (slug) {
      if (itemValue.items !== undefined) {
        navError(collection, `${itemLocation} cannot define both slug and items.`);
      }

      const page = pageBySlug.get(slug);

      if (!page) {
        navError(collection, `${itemLocation}.slug references missing ${collection.itemLabel} "${slug}".`);
      }

      if (placedSlugs.has(slug)) {
        navError(collection, `${collection.itemLabel} slug "${slug}" is listed more than once in navigation.`);
      }

      placedSlugs.add(slug);

      return contentNavNode(collection, page, optionalString(itemValue, "title"));
    }

    const id = requireString(collection, itemValue, "id", collection.navigationPath);
    const label = requireString(collection, itemValue, "title", collection.navigationPath);

    if (groupIds.has(id)) {
      navError(collection, `Group id "${id}" is used more than once.`);
    }

    groupIds.add(id);

    return {
      id,
      type: "group",
      label,
      defaultOpen: itemValue.defaultOpen !== false,
      children: parseNavItems(collection, itemValue.items, pageBySlug, placedSlugs, groupIds, `${itemLocation}.items`),
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

function getNavigationTitle(collection: ContentCollectionConfig): string {
  const document = readNavigationDocument(collection);
  const title = optionalString(document, "title");

  return title ?? collection.defaultTitle;
}

export function getGuideNavigationTitle(): string {
  return getNavigationTitle(GUIDES_COLLECTION);
}

function getNavigation(collection: ContentCollectionConfig): NavNode[] {
  const pages = getPages(collection);
  const document = readNavigationDocument(collection);
  const placedSlugs = new Set<string>();
  const groupIds = new Set<string>();

  return parseNavItems(collection, document.sections, pagesBySlug(pages), placedSlugs, groupIds, "sections");
}

export function getGuideNavigation(): NavNode[] {
  return getNavigation(GUIDES_COLLECTION);
}

function getFirstPageHref(collection: ContentCollectionConfig): string {
  const navigationFirst = firstPageInNavigation(getNavigation(collection));

  if (navigationFirst?.href) {
    return navigationFirst.href;
  }

  const page = getPages(collection)[0];

  return page?.href ?? "/";
}

export function getFirstGuidePageHref(): string {
  return getFirstPageHref(GUIDES_COLLECTION);
}

export function getWebhookPages(): ContentPage[] {
  return getPages(WEBHOOKS_COLLECTION);
}

export function getWebhookPage(slug: string): ContentPage | undefined {
  return getWebhookPages().find((page) => page.slug === slug);
}

export function getWebhookPageStaticParams(): Array<{ slug: string }> {
  return getWebhookPages().map((page) => ({ slug: page.slug }));
}

export function getWebhookNavigationTitle(): string {
  return getNavigationTitle(WEBHOOKS_COLLECTION);
}

export function getWebhookNavigation(): NavNode[] {
  return getNavigation(WEBHOOKS_COLLECTION);
}

export function getFirstWebhookPageHref(): string {
  return getFirstPageHref(WEBHOOKS_COLLECTION);
}

export function getSdkPages(): ContentPage[] {
  return getPages(SDK_COLLECTION);
}

export function getSdkPage(slug: string): ContentPage | undefined {
  return getSdkPages().find((page) => page.slug === slug);
}

export function getSdkPageStaticParams(): Array<{ slug: string }> {
  return getSdkPages().map((page) => ({ slug: page.slug }));
}

export function getSdkNavigationTitle(): string {
  return getNavigationTitle(SDK_COLLECTION);
}

export function getSdkNavigation(): NavNode[] {
  return getNavigation(SDK_COLLECTION);
}

export function getFirstSdkPageHref(): string {
  return getFirstPageHref(SDK_COLLECTION);
}
