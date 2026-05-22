import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parse, stringify } from "yaml";

export type AdminContentArea = "api" | "articles";
export type DraftStatus = "published" | "modified" | "new" | "deleted";

type UnknownRecord = Record<string, unknown>;

interface WorkspacePaths {
  root: string;
  contentRoot: string;
  publicRoot: string;
  draftRoot: string;
  draftApi: string;
  draftApiEndpoints: string;
  draftArticles: string;
  draftArticlePages: string;
  publishedApi: string;
  publishedApiEndpoints: string;
  publishedArticles: string;
  publishedArticlePages: string;
}

export interface AdminNavSection {
  id: string;
  label: string;
  depth: number;
}

export interface AdminItemSummary {
  slug: string;
  title: string;
  description?: string;
  status: DraftStatus;
  existsInDraft: boolean;
  existsInPublished: boolean;
}

export interface AdminApiState {
  endpoints: AdminItemSummary[];
  selectedSlug?: string;
  selectedEndpoint?: UnknownRecord;
  navigationYaml: string;
  navigationStatus: DraftStatus;
  sections: AdminNavSection[];
}

export interface AdminArticlesState {
  articles: AdminItemSummary[];
  selectedSlug?: string;
  selectedArticle?: UnknownRecord;
  navigationYaml: string;
  navigationStatus: DraftStatus;
  sections: AdminNavSection[];
}

export interface EndpointDraftInput {
  originalSlug?: string;
  slug: string;
  title: string;
  description: string;
  method: string;
  path: string;
  status: string;
  headerParameters: unknown[];
  pathParameters: unknown[];
  queryParameters: unknown[];
  requestBodyParameters: unknown[];
  responses: unknown[];
  blocks: unknown[];
  requestExamples: unknown[];
  responseExamples: unknown[];
}

export interface ArticleDraftInput {
  originalSlug?: string;
  slug: string;
  title: string;
  description?: string;
  content: string;
  blocks: unknown[];
}

function workspacePaths(root = process.cwd()): WorkspacePaths {
  const contentRoot = path.join(root, "content");
  const draftRoot = path.join(contentRoot, ".drafts");

  return {
    root,
    contentRoot,
    publicRoot: path.join(root, "public"),
    draftRoot,
    draftApi: path.join(draftRoot, "api"),
    draftApiEndpoints: path.join(draftRoot, "api", "endpoints"),
    draftArticles: path.join(draftRoot, "articles"),
    draftArticlePages: path.join(draftRoot, "articles", "pages"),
    publishedApi: path.join(contentRoot, "api"),
    publishedApiEndpoints: path.join(contentRoot, "api", "endpoints"),
    publishedArticles: path.join(contentRoot, "articles"),
    publishedArticlePages: path.join(contentRoot, "articles", "pages"),
  };
}

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

function requiredString(value: unknown, field: string): string {
  const next = asString(value).trim();

  if (!next) {
    throw new Error(`${field} is required.`);
  }

  return next;
}

function normalizeSlug(value: string): string {
  const slug = value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "untitled";
}

export function slugFromAdminInput(value: string): string {
  return normalizeSlug(value);
}

function assertSafeSlug(slug: string) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error(`Slug "${slug}" may contain only lowercase letters, numbers, and hyphens.`);
  }
}

function yamlFilePath(dirPath: string, slug: string): string {
  assertSafeSlug(slug);

  return path.join(dirPath, `${slug}.yaml`);
}

function readText(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function readYamlObject(filePath: string, label: string): UnknownRecord {
  let parsed: unknown;

  try {
    parsed = parse(readText(filePath));
  } catch (error) {
    throw new Error(`${label} contains invalid YAML at ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!isRecord(parsed)) {
    throw new Error(`${label} must be a YAML object at ${filePath}.`);
  }

  return parsed;
}

function writeTextAtomic(filePath: string, value: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const tempPath = `${filePath}.${crypto.randomUUID()}.tmp`;

  fs.writeFileSync(tempPath, value.endsWith("\n") ? value : `${value}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
}

function writeYamlObject(filePath: string, value: UnknownRecord) {
  writeTextAtomic(filePath, stringify(value, { lineWidth: 0 }));
}

function copyDir(source: string, destination: string) {
  if (!fs.existsSync(source)) {
    throw new Error(`Required source directory was not found: ${source}`);
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
}

export function ensureDraftContent(root = process.cwd()) {
  const paths = workspacePaths(root);

  fs.mkdirSync(paths.draftRoot, { recursive: true });

  if (!fs.existsSync(paths.draftApi)) {
    copyDir(paths.publishedApi, paths.draftApi);
  }

  if (!fs.existsSync(paths.draftArticles)) {
    copyDir(paths.publishedArticles, paths.draftArticles);
  }
}

function fileStatus(draftPath: string, publishedPath: string): DraftStatus {
  const draftExists = fs.existsSync(draftPath);
  const publishedExists = fs.existsSync(publishedPath);

  if (draftExists && !publishedExists) {
    return "new";
  }

  if (!draftExists && publishedExists) {
    return "deleted";
  }

  if (!draftExists && !publishedExists) {
    return "published";
  }

  return readText(draftPath) === readText(publishedPath) ? "published" : "modified";
}

function yamlFilePaths(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .sort()
    .map((file) => path.join(dirPath, file));
}

function fileSlug(filePath: string): string {
  return path.basename(filePath).replace(/\.ya?ml$/i, "");
}

function readItemMeta(filePath: string, fallbackSlug: string): Pick<AdminItemSummary, "slug" | "title" | "description"> {
  if (!fs.existsSync(filePath)) {
    return {
      slug: fallbackSlug,
      title: fallbackSlug,
    };
  }

  try {
    const document = readYamlObject(filePath, "Content file");
    const slug = asString(document.slug, fallbackSlug) || fallbackSlug;
    const title = asString(document.title, slug) || slug;
    const description = asString(document.description).trim() || undefined;

    return { slug, title, description };
  } catch {
    return {
      slug: fallbackSlug,
      title: `${fallbackSlug} (invalid YAML)`,
    };
  }
}

function listContentItems(draftDir: string, publishedDir: string): AdminItemSummary[] {
  const slugs = new Set<string>();

  yamlFilePaths(draftDir).forEach((filePath) => slugs.add(fileSlug(filePath)));
  yamlFilePaths(publishedDir).forEach((filePath) => slugs.add(fileSlug(filePath)));

  return Array.from(slugs)
    .map((slug) => {
      const draftPath = yamlFilePath(draftDir, slug);
      const publishedPath = yamlFilePath(publishedDir, slug);
      const existsInDraft = fs.existsSync(draftPath);
      const existsInPublished = fs.existsSync(publishedPath);
      const meta = readItemMeta(existsInDraft ? draftPath : publishedPath, slug);

      return {
        ...meta,
        slug,
        status: fileStatus(draftPath, publishedPath),
        existsInDraft,
        existsInPublished,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

function readNavigationYaml(draftPath: string): string {
  if (!fs.existsSync(draftPath)) {
    return "sections: []\n";
  }

  return readText(draftPath);
}

function collectSectionsFromItems(items: unknown, depth: number, sections: AdminNavSection[]) {
  if (!Array.isArray(items)) {
    return;
  }

  items.forEach((item) => {
    if (!isRecord(item) || asString(item.slug).trim()) {
      return;
    }

    const id = asString(item.id).trim();
    const label = asString(item.title, id).trim();

    if (id) {
      sections.push({ id, label: label || id, depth });
    }

    collectSectionsFromItems(item.items, depth + 1, sections);
  });
}

function collectNavigationSections(navigationYaml: string): AdminNavSection[] {
  try {
    const document = parse(navigationYaml);
    const sections: AdminNavSection[] = [];

    if (isRecord(document)) {
      collectSectionsFromItems(document.sections, 0, sections);
    }

    return sections;
  } catch {
    return [];
  }
}

function selectedExistingSlug(items: AdminItemSummary[], requested?: string): string | undefined {
  if (requested && items.some((item) => item.slug === requested)) {
    return requested;
  }

  return items.find((item) => item.existsInDraft)?.slug ?? items[0]?.slug;
}

export function getAdminApiState(selected?: string, root = process.cwd()): AdminApiState {
  ensureDraftContent(root);

  const paths = workspacePaths(root);
  const endpoints = listContentItems(paths.draftApiEndpoints, paths.publishedApiEndpoints);
  const selectedSlug = selectedExistingSlug(endpoints, selected);
  const selectedPath = selectedSlug ? yamlFilePath(paths.draftApiEndpoints, selectedSlug) : "";
  const navigationPath = path.join(paths.draftApi, "navigation.yaml");
  const publishedNavigationPath = path.join(paths.publishedApi, "navigation.yaml");
  const navigationYaml = readNavigationYaml(navigationPath);

  return {
    endpoints,
    selectedSlug,
    selectedEndpoint: selectedSlug && fs.existsSync(selectedPath) ? readYamlObject(selectedPath, "API endpoint draft") : undefined,
    navigationYaml,
    navigationStatus: fileStatus(navigationPath, publishedNavigationPath),
    sections: collectNavigationSections(navigationYaml),
  };
}

export function getAdminArticlesState(selected?: string, root = process.cwd()): AdminArticlesState {
  ensureDraftContent(root);

  const paths = workspacePaths(root);
  const articles = listContentItems(paths.draftArticlePages, paths.publishedArticlePages);
  const selectedSlug = selectedExistingSlug(articles, selected);
  const selectedPath = selectedSlug ? yamlFilePath(paths.draftArticlePages, selectedSlug) : "";
  const navigationPath = path.join(paths.draftArticles, "navigation.yaml");
  const publishedNavigationPath = path.join(paths.publishedArticles, "navigation.yaml");
  const navigationYaml = readNavigationYaml(navigationPath);

  return {
    articles,
    selectedSlug,
    selectedArticle: selectedSlug && fs.existsSync(selectedPath) ? readYamlObject(selectedPath, "Article draft") : undefined,
    navigationYaml,
    navigationStatus: fileStatus(navigationPath, publishedNavigationPath),
    sections: collectNavigationSections(navigationYaml),
  };
}

function parseNavigationFile(filePath: string): UnknownRecord {
  if (!fs.existsSync(filePath)) {
    return { sections: [] };
  }

  const document = readYamlObject(filePath, "Navigation draft");

  if (!Array.isArray(document.sections)) {
    throw new Error("Navigation draft must contain a sections array.");
  }

  return document;
}

function visitNavItems(value: unknown, visitor: (item: UnknownRecord, index: number, items: UnknownRecord[]) => void) {
  if (!Array.isArray(value)) {
    return;
  }

  const items = value.filter(isRecord);

  items.forEach((item, index) => {
    visitor(item, index, items);
    visitNavItems(item.items, visitor);
  });
}

function replaceSlugInNavigation(document: UnknownRecord, oldSlug: string, newSlug: string) {
  visitNavItems(document.sections, (item) => {
    if (asString(item.slug).trim() === oldSlug) {
      item.slug = newSlug;
    }
  });
}

function removeSlugFromNavigationItems(value: unknown, slug: string): unknown[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const nextItems: unknown[] = [];

  value.forEach((item) => {
    if (isRecord(item) && asString(item.slug).trim() === slug) {
      return;
    }

    if (isRecord(item) && item.items !== undefined) {
      const children = removeSlugFromNavigationItems(item.items, slug);

      if (children.length > 0) {
        nextItems.push({
          ...item,
          items: children,
        });
      }

      return;
    }

    nextItems.push(item);
  });

  return nextItems;
}

function removeSlugFromNavigation(document: UnknownRecord, slug: string) {
  document.sections = removeSlugFromNavigationItems(document.sections, slug);
}

function navigationContainsSlug(document: UnknownRecord, slug: string): boolean {
  let found = false;

  visitNavItems(document.sections, (item) => {
    if (asString(item.slug).trim() === slug) {
      found = true;
    }
  });

  return found;
}

function addItemToNavigationSection(document: UnknownRecord, sectionId: string | undefined, item: UnknownRecord) {
  let added = false;
  let fallbackGroup: UnknownRecord | undefined;

  visitNavItems(document.sections, (navItem) => {
    if (asString(navItem.slug).trim()) {
      return;
    }

    fallbackGroup ??= navItem;

    if (sectionId && asString(navItem.id).trim() === sectionId) {
      const existingItems = Array.isArray(navItem.items) ? navItem.items : [];

      navItem.items = [...existingItems, item];
      added = true;
    }
  });

  if (!added && fallbackGroup) {
    const existingItems = Array.isArray(fallbackGroup.items) ? fallbackGroup.items : [];

    fallbackGroup.items = [...existingItems, item];
    added = true;
  }

  if (!added) {
    throw new Error("Navigation must contain at least one section before adding an item.");
  }
}

function draftNavigationPath(paths: WorkspacePaths, area: AdminContentArea): string {
  return area === "api"
    ? path.join(paths.draftApi, "navigation.yaml")
    : path.join(paths.draftArticles, "navigation.yaml");
}

function updateNavigation(root: string, area: AdminContentArea, updater: (document: UnknownRecord) => void) {
  const paths = workspacePaths(root);
  const navigationPath = draftNavigationPath(paths, area);
  const document = parseNavigationFile(navigationPath);

  updater(document);
  writeYamlObject(navigationPath, document);
}

export function saveNavigationDraft(area: AdminContentArea, yaml: string, root = process.cwd()) {
  ensureDraftContent(root);

  const parsed = parse(yaml);

  if (!isRecord(parsed) || !Array.isArray(parsed.sections)) {
    throw new Error("Navigation YAML must be an object with a sections array.");
  }

  writeTextAtomic(draftNavigationPath(workspacePaths(root), area), yaml);
}

export function formatYamlValue(value: unknown): string {
  if (value === undefined || value === null) {
    return "[]";
  }

  return stringify(value, { lineWidth: 0 }).trimEnd();
}

function endpointDocument(input: EndpointDraftInput): UnknownRecord {
  const slug = requiredString(input.slug, "slug");

  assertSafeSlug(slug);

  return {
    slug,
    title: requiredString(input.title, "title"),
    description: requiredString(input.description, "description"),
    method: requiredString(input.method, "method").toUpperCase(),
    path: requiredString(input.path, "path"),
    status: requiredString(input.status, "status"),
    headerParameters: input.headerParameters,
    pathParameters: input.pathParameters,
    queryParameters: input.queryParameters,
    requestBodyParameters: input.requestBodyParameters,
    responses: input.responses,
    blocks: input.blocks,
    requestExamples: input.requestExamples,
    responseExamples: input.responseExamples,
  };
}

export function saveEndpointDraft(input: EndpointDraftInput, root = process.cwd()): string {
  ensureDraftContent(root);

  const paths = workspacePaths(root);
  const document = endpointDocument(input);
  const slug = asString(document.slug);
  const originalSlug = input.originalSlug?.trim() || slug;
  const targetPath = yamlFilePath(paths.draftApiEndpoints, slug);
  const publishedTargetPath = yamlFilePath(paths.publishedApiEndpoints, slug);
  const originalPath = yamlFilePath(paths.draftApiEndpoints, originalSlug);

  if (slug !== originalSlug && (fs.existsSync(targetPath) || fs.existsSync(publishedTargetPath))) {
    throw new Error(`Endpoint "${slug}" already exists.`);
  }

  writeYamlObject(targetPath, document);

  if (slug !== originalSlug && fs.existsSync(originalPath)) {
    fs.unlinkSync(originalPath);
    updateNavigation(root, "api", (navigation) => replaceSlugInNavigation(navigation, originalSlug, slug));
  }

  return slug;
}

export function createEndpointDraft(input: EndpointDraftInput, sectionId?: string, root = process.cwd()): string {
  ensureDraftContent(root);

  const paths = workspacePaths(root);
  const slug = requiredString(input.slug, "slug");
  const draftPath = yamlFilePath(paths.draftApiEndpoints, slug);
  const publishedPath = yamlFilePath(paths.publishedApiEndpoints, slug);

  if (fs.existsSync(draftPath) || fs.existsSync(publishedPath)) {
    throw new Error(`Endpoint "${slug}" already exists.`);
  }

  const createdSlug = saveEndpointDraft(input, root);

  updateNavigation(root, "api", (navigation) => {
    if (!navigationContainsSlug(navigation, createdSlug)) {
      addItemToNavigationSection(navigation, sectionId, {
        title: input.title,
        slug: createdSlug,
      });
    }
  });

  return createdSlug;
}

export function deleteEndpointDraft(slug: string, root = process.cwd()) {
  ensureDraftContent(root);

  const paths = workspacePaths(root);
  const filePath = yamlFilePath(paths.draftApiEndpoints, slug);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  updateNavigation(root, "api", (navigation) => removeSlugFromNavigation(navigation, slug));
}

export function restoreEndpointDraft(slug: string, sectionId?: string, root = process.cwd()) {
  ensureDraftContent(root);

  const paths = workspacePaths(root);
  const publishedPath = yamlFilePath(paths.publishedApiEndpoints, slug);
  const draftPath = yamlFilePath(paths.draftApiEndpoints, slug);

  if (!fs.existsSync(publishedPath)) {
    throw new Error(`Published endpoint "${slug}" was not found.`);
  }

  fs.mkdirSync(path.dirname(draftPath), { recursive: true });
  fs.copyFileSync(publishedPath, draftPath);

  const meta = readItemMeta(publishedPath, slug);

  updateNavigation(root, "api", (navigation) => {
    if (!navigationContainsSlug(navigation, slug)) {
      addItemToNavigationSection(navigation, sectionId, {
        title: meta.title,
        slug,
      });
    }
  });
}

function articleDocument(input: ArticleDraftInput): UnknownRecord {
  const slug = requiredString(input.slug, "slug");
  const description = input.description?.trim();

  assertSafeSlug(slug);

  return {
    slug,
    title: requiredString(input.title, "title"),
    ...(description ? { description } : {}),
    content: requiredString(input.content, "content"),
    blocks: input.blocks,
  };
}

export function saveArticleDraft(input: ArticleDraftInput, root = process.cwd()): string {
  ensureDraftContent(root);

  const paths = workspacePaths(root);
  const document = articleDocument(input);
  const slug = asString(document.slug);
  const originalSlug = input.originalSlug?.trim() || slug;
  const targetPath = yamlFilePath(paths.draftArticlePages, slug);
  const publishedTargetPath = yamlFilePath(paths.publishedArticlePages, slug);
  const originalPath = yamlFilePath(paths.draftArticlePages, originalSlug);

  if (slug !== originalSlug && (fs.existsSync(targetPath) || fs.existsSync(publishedTargetPath))) {
    throw new Error(`Article "${slug}" already exists.`);
  }

  writeYamlObject(targetPath, document);

  if (slug !== originalSlug && fs.existsSync(originalPath)) {
    fs.unlinkSync(originalPath);
    updateNavigation(root, "articles", (navigation) => replaceSlugInNavigation(navigation, originalSlug, slug));
  }

  return slug;
}

export function createArticleDraft(input: ArticleDraftInput, sectionId?: string, root = process.cwd()): string {
  ensureDraftContent(root);

  const paths = workspacePaths(root);
  const slug = requiredString(input.slug, "slug");
  const draftPath = yamlFilePath(paths.draftArticlePages, slug);
  const publishedPath = yamlFilePath(paths.publishedArticlePages, slug);

  if (fs.existsSync(draftPath) || fs.existsSync(publishedPath)) {
    throw new Error(`Article "${slug}" already exists.`);
  }

  const createdSlug = saveArticleDraft(input, root);

  updateNavigation(root, "articles", (navigation) => {
    if (!navigationContainsSlug(navigation, createdSlug)) {
      addItemToNavigationSection(navigation, sectionId, {
        title: input.title,
        slug: createdSlug,
      });
    }
  });

  return createdSlug;
}

export function deleteArticleDraft(slug: string, root = process.cwd()) {
  ensureDraftContent(root);

  const paths = workspacePaths(root);
  const filePath = yamlFilePath(paths.draftArticlePages, slug);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  updateNavigation(root, "articles", (navigation) => removeSlugFromNavigation(navigation, slug));
}

export function restoreArticleDraft(slug: string, sectionId?: string, root = process.cwd()) {
  ensureDraftContent(root);

  const paths = workspacePaths(root);
  const publishedPath = yamlFilePath(paths.publishedArticlePages, slug);
  const draftPath = yamlFilePath(paths.draftArticlePages, slug);

  if (!fs.existsSync(publishedPath)) {
    throw new Error(`Published article "${slug}" was not found.`);
  }

  fs.mkdirSync(path.dirname(draftPath), { recursive: true });
  fs.copyFileSync(publishedPath, draftPath);

  const meta = readItemMeta(publishedPath, slug);

  updateNavigation(root, "articles", (navigation) => {
    if (!navigationContainsSlug(navigation, slug)) {
      addItemToNavigationSection(navigation, sectionId, {
        title: meta.title,
        slug,
      });
    }
  });
}

function copyDraftForValidation(root: string, tempRoot: string) {
  const paths = workspacePaths(root);
  const tempContentRoot = path.join(tempRoot, "content");

  fs.mkdirSync(tempContentRoot, { recursive: true });
  copyDir(paths.draftApi, path.join(tempContentRoot, "api"));
  copyDir(paths.draftArticles, path.join(tempContentRoot, "articles"));

  if (fs.existsSync(paths.publicRoot)) {
    copyDir(paths.publicRoot, path.join(tempRoot, "public"));
  }
}

export function validateDraftContent(root = process.cwd()): string {
  ensureDraftContent(root);

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "api-docs-admin-validate-"));

  try {
    copyDraftForValidation(root, tempRoot);

    const result = spawnSync(process.execPath, [path.join(root, "scripts", "validate-content.mjs"), "--root", tempRoot], {
      cwd: root,
      encoding: "utf8",
    });

    if (result.status !== 0) {
      throw new Error(
        [
          "Draft validation failed.",
          result.stdout.trim(),
          result.stderr.trim(),
        ].filter(Boolean).join("\n"),
      );
    }

    return result.stdout.trim();
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function replacePublishedArea(paths: WorkspacePaths, area: "api" | "articles", backupRoot: string) {
  const source = area === "api" ? paths.draftApi : paths.draftArticles;
  const target = area === "api" ? paths.publishedApi : paths.publishedArticles;
  const next = path.join(paths.contentRoot, `.publish-next-${area}-${crypto.randomUUID()}`);
  const backup = path.join(backupRoot, area);

  copyDir(source, next);

  if (fs.existsSync(target)) {
    fs.renameSync(target, backup);
  }

  fs.renameSync(next, target);
}

function restorePublishedArea(paths: WorkspacePaths, area: "api" | "articles", backupRoot: string) {
  const target = area === "api" ? paths.publishedApi : paths.publishedArticles;
  const backup = path.join(backupRoot, area);

  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }

  if (fs.existsSync(backup)) {
    fs.renameSync(backup, target);
  }
}

export function publishDraftContent(root = process.cwd()): string {
  const validationOutput = validateDraftContent(root);
  const paths = workspacePaths(root);
  const backupRoot = path.join(paths.contentRoot, `.publish-backup-${crypto.randomUUID()}`);

  fs.mkdirSync(backupRoot, { recursive: true });

  try {
    replacePublishedArea(paths, "api", backupRoot);
    replacePublishedArea(paths, "articles", backupRoot);
    fs.rmSync(backupRoot, { recursive: true, force: true });

    return validationOutput;
  } catch (error) {
    restorePublishedArea(paths, "api", backupRoot);
    restorePublishedArea(paths, "articles", backupRoot);
    fs.rmSync(backupRoot, { recursive: true, force: true });

    throw error;
  }
}
