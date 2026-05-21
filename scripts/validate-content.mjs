#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete", "options", "head"]);
const NOTICE_BLOCK_TYPES = new Set(["note", "info", "warning", "danger", "tip"]);

function parseArgs() {
  const rootIndex = process.argv.indexOf("--root");

  if (rootIndex === -1) {
    return { root: process.cwd() };
  }

  const root = process.argv[rootIndex + 1];

  if (!root) {
    throw new Error("--root requires a directory path.");
  }

  return { root: path.resolve(root) };
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function slugify(value) {
  const slug = value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "untitled";
}

function readYamlObject(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} was not found at ${filePath}.`);
  }

  let parsed;

  try {
    parsed = parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${label} contains invalid YAML at ${filePath}: ${error.message}`);
  }

  if (!isRecord(parsed)) {
    throw new Error(`${label} must be a YAML object at ${filePath}.`);
  }

  return parsed;
}

function contentError(label, filePath, message) {
  throw new Error(`Invalid ${label} at ${filePath}: ${message}`);
}

function navError(label, filePath, message) {
  throw new Error(`Invalid ${label} at ${filePath}: ${message}`);
}

function requireString(record, field, filePath, label) {
  const value = asString(record[field]).trim();

  if (!value) {
    contentError(label, filePath, `${field} is required and must be a non-empty string.`);
  }

  return value;
}

function ensureArray(value, field, filePath, label, options = {}) {
  if (value === undefined || value === null) {
    if (options.required) {
      contentError(label, filePath, `${field} is required and must be an array.`);
    }

    return [];
  }

  if (!Array.isArray(value)) {
    contentError(label, filePath, `${field} must be an array when provided.`);
  }

  if (options.minItems && value.length < options.minItems) {
    contentError(label, filePath, `${field} must contain at least ${options.minItems} item.`);
  }

  return value;
}

function yamlFilePaths(dirPath, label) {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`${label} directory was not found at ${dirPath}.`);
  }

  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .sort()
    .map((file) => path.join(dirPath, file));
}

function fileSlug(filePath) {
  return path.basename(filePath).replace(/\.ya?ml$/i, "");
}

function validateSlugMatchesFile(slug, filePath, label) {
  const expected = fileSlug(filePath);

  if (slug !== expected) {
    contentError(label, filePath, `slug "${slug}" must match filename "${expected}".`);
  }
}

function validatePublicAsset(root, src, filePath, label, location) {
  if (/^[a-z][a-z\d+.-]*:/i.test(src) || src.startsWith("//")) {
    return;
  }

  if (!src.startsWith("/")) {
    contentError(label, filePath, `${location} references local image "${src}". Use an absolute public path like /images/example.png.`);
  }

  const publicRoot = path.join(root, "public");
  const publicPath = path.normalize(path.join(publicRoot, src.replace(/^\/+/, "")));
  const publicRootWithSeparator = `${publicRoot}${path.sep}`;

  if (publicPath !== publicRoot && !publicPath.startsWith(publicRootWithSeparator)) {
    contentError(label, filePath, `${location} must stay inside the public directory.`);
  }

  if (!fs.existsSync(publicPath)) {
    contentError(label, filePath, `${location} references missing public asset "${src}" (expected ${publicPath}).`);
  }
}

function validateMarkdownImages(root, source, filePath, label, location) {
  if (!source) {
    return;
  }

  const imagePattern = /!\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  let match;

  while ((match = imagePattern.exec(source)) !== null) {
    validatePublicAsset(root, match[1] ?? "", filePath, label, `${location} Markdown image`);
  }
}

function validateSchemaNode(value, filePath, label, location, options = {}) {
  if (!isRecord(value)) {
    contentError(label, filePath, `${location} must be an object.`);
  }

  const requireRequired = options.requireRequired ?? true;

  requireString(value, "type", filePath, label);

  if (value.children !== undefined) {
    ensureArray(value.children, `${location}.children`, filePath, label).forEach((child, index) => {
      if (!isRecord(child)) {
        contentError(label, filePath, `${location}.children[${index}] must be an object.`);
      }

      if (requireRequired && typeof child.required !== "boolean") {
        contentError(label, filePath, `${location}.children[${index}].required must be a boolean.`);
      }

      validateSchemaNode(child, filePath, label, `${location}.children[${index}]`, options);
    });
  }

  if (value.items !== undefined) {
    validateSchemaNode(value.items, filePath, label, `${location}.items`, options);
  }
}

function validateRequestParameter(value, field, index, filePath, label) {
  if (!isRecord(value)) {
    contentError(label, filePath, `${field}[${index}] must be an object.`);
  }

  requireString(value, "name", filePath, label);
  requireString(value, "type", filePath, label);
  requireString(value, "description", filePath, label);

  if (typeof value.required !== "boolean") {
    contentError(label, filePath, `${field}[${index}].required must be a boolean.`);
  }

  validateSchemaNode(value, filePath, label, `${field}[${index}]`);
}

function validateRequestParameters(record, fields, filePath, label) {
  fields.forEach((field) => {
    ensureArray(record[field], field, filePath, label).forEach((value, index) => {
      validateRequestParameter(value, field, index, filePath, label);
    });
  });
}

function validateResponses(value, filePath, label) {
  ensureArray(value, "responses", filePath, label).forEach((response, index) => {
    if (!isRecord(response)) {
      contentError(label, filePath, `responses[${index}] must be an object.`);
    }

    requireString(response, "status", filePath, label);
    requireString(response, "description", filePath, label);

    ensureArray(response.parameters, `responses[${index}].parameters`, filePath, label).forEach((parameter, parameterIndex) => {
      if (!isRecord(parameter)) {
        contentError(label, filePath, `responses[${index}].parameters[${parameterIndex}] must be an object.`);
      }

      requireString(parameter, "name", filePath, label);
      requireString(parameter, "type", filePath, label);
      requireString(parameter, "description", filePath, label);
      validateSchemaNode(parameter, filePath, label, `responses[${index}].parameters[${parameterIndex}]`, {
        requireRequired: false,
      });
    });
  });
}

function validateEndpointBlocks(root, value, filePath) {
  ensureArray(value, "blocks", filePath, "API content").forEach((block, index) => {
    if (!isRecord(block)) {
      contentError("API content", filePath, `blocks[${index}] must be an object.`);
    }

    requireString(block, "type", filePath, "API content");
    const content = requireString(block, "content", filePath, "API content");

    validateMarkdownImages(root, content, filePath, "API content", `blocks[${index}].content`);
  });
}

function validateExamples(value, field, filePath, label) {
  const seenLabels = new Map();
  const seenIds = new Map();

  ensureArray(value, field, filePath, label).forEach((example, index) => {
    if (!isRecord(example)) {
      contentError(label, filePath, `${field}[${index}] must be an object.`);
    }

    const exampleLabel = requireString(example, "label", filePath, label);
    const normalizedLabel = exampleLabel.toLowerCase();
    const id = slugify(exampleLabel);
    const previousLabelIndex = seenLabels.get(normalizedLabel);
    const previousIdLabel = seenIds.get(id);

    if (previousLabelIndex !== undefined) {
      contentError(label, filePath, `${field}[${index}].label duplicates ${field}[${previousLabelIndex}].label.`);
    }

    if (previousIdLabel) {
      contentError(label, filePath, `${field}[${index}].label "${exampleLabel}" generates duplicate selector id "${id}" with "${previousIdLabel}".`);
    }

    seenLabels.set(normalizedLabel, index);
    seenIds.set(id, exampleLabel);

    requireString(example, "language", filePath, label);
    requireString(example, "code", filePath, label);
  });
}

function validateEndpointFile(root, filePath) {
  const endpoint = readYamlObject(filePath, "API endpoint file");
  const slug = requireString(endpoint, "slug", filePath, "API content");
  const title = requireString(endpoint, "title", filePath, "API content");
  const description = requireString(endpoint, "description", filePath, "API content");
  const method = requireString(endpoint, "method", filePath, "API content").toLowerCase();
  const endpointPath = requireString(endpoint, "path", filePath, "API content");

  requireString(endpoint, "status", filePath, "API content");
  validateSlugMatchesFile(slug, filePath, "API content");
  validateMarkdownImages(root, description, filePath, "API content", "description");

  if (!HTTP_METHODS.has(method)) {
    contentError("API content", filePath, `method must be one of ${Array.from(HTTP_METHODS).map((item) => item.toUpperCase()).join(", ")}.`);
  }

  if (!endpointPath.startsWith("/")) {
    contentError("API content", filePath, "path must start with /.");
  }

  validateRequestParameters(endpoint, ["headerParameters", "pathParameters", "queryParameters", "requestBodyParameters"], filePath, "API content");
  validateResponses(endpoint.responses, filePath, "API content");
  validateEndpointBlocks(root, endpoint.blocks, filePath);
  validateExamples(endpoint.requestExamples, "requestExamples", filePath, "API content");
  validateExamples(endpoint.responseExamples, "responseExamples", filePath, "API content");

  return {
    slug,
    title,
    filePath,
  };
}

function validateArticleBlocks(root, value, filePath) {
  ensureArray(value, "blocks", filePath, "article content").forEach((block, index) => {
    if (!isRecord(block)) {
      contentError("article content", filePath, `blocks[${index}] must be an object.`);
    }

    const type = requireString(block, "type", filePath, "article content");
    const content = asString(block.content).trim();

    if (NOTICE_BLOCK_TYPES.has(type) && !content) {
      contentError("article content", filePath, `blocks[${index}].content is required for ${type} blocks.`);
    }

    if (type === "code") {
      requireString(block, "code", filePath, "article content");
    }

    if (type === "image") {
      const src = requireString(block, "src", filePath, "article content");

      validatePublicAsset(root, src, filePath, "article content", `blocks[${index}].src`);
    }

    validateMarkdownImages(root, content, filePath, "article content", `blocks[${index}].content`);
  });
}

function validateArticleFile(root, filePath) {
  const page = readYamlObject(filePath, "Article file");
  const slug = requireString(page, "slug", filePath, "article content");
  const title = requireString(page, "title", filePath, "article content");
  const content = requireString(page, "content", filePath, "article content");

  validateSlugMatchesFile(slug, filePath, "article content");
  validateMarkdownImages(root, content, filePath, "article content", "content");
  validateArticleBlocks(root, page.blocks, filePath);

  return {
    slug,
    title,
    filePath,
  };
}

function validateNavigationItems(value, knownBySlug, placedSlugs, groupIds, filePath, label, itemLabel, location) {
  if (!Array.isArray(value)) {
    navError(label, filePath, `${location} must be an array.`);
  }

  if (value.length === 0) {
    navError(label, filePath, `${location} must contain at least one item.`);
  }

  value.forEach((item, index) => {
    const itemLocation = `${location}[${index}]`;

    if (!isRecord(item)) {
      navError(label, filePath, `${itemLocation} must be an object.`);
    }

    const slug = asString(item.slug).trim();

    if (slug) {
      if (item.items !== undefined) {
        navError(label, filePath, `${itemLocation} cannot define both slug and items.`);
      }

      if (!knownBySlug.has(slug)) {
        navError(label, filePath, `${itemLocation}.slug references missing ${itemLabel} "${slug}".`);
      }

      if (placedSlugs.has(slug)) {
        navError(label, filePath, `${itemLabel} slug "${slug}" is listed more than once in navigation.`);
      }

      placedSlugs.add(slug);
      return;
    }

    const id = requireString(item, "id", filePath, label);

    requireString(item, "title", filePath, label);

    if (item.defaultOpen !== undefined && typeof item.defaultOpen !== "boolean") {
      navError(label, filePath, `${itemLocation}.defaultOpen must be a boolean when provided.`);
    }

    if (groupIds.has(id)) {
      navError(label, filePath, `Group id "${id}" is used more than once.`);
    }

    groupIds.add(id);
    validateNavigationItems(item.items, knownBySlug, placedSlugs, groupIds, filePath, label, itemLabel, `${itemLocation}.items`);
  });
}

function validateNavigation(filePath, label, knownBySlug, itemLabel) {
  const document = readYamlObject(filePath, label);

  if (!Array.isArray(document.sections)) {
    navError(label, filePath, "sections must be an array.");
  }

  if (document.sections.length === 0) {
    navError(label, filePath, "sections must contain at least one section.");
  }

  validateNavigationItems(document.sections, knownBySlug, new Set(), new Set(), filePath, label, itemLabel, "sections");
}

function bySlug(items, label) {
  const map = new Map();

  items.forEach((item) => {
    const existing = map.get(item.slug);

    if (existing) {
      throw new Error(`Duplicate ${label} slug "${item.slug}" in ${existing.filePath} and ${item.filePath}.`);
    }

    map.set(item.slug, item);
  });

  return map;
}

function validateApi(root) {
  const apiRoot = path.join(root, "content", "api");
  const endpoints = yamlFilePaths(path.join(apiRoot, "endpoints"), "API endpoints").map((filePath) =>
    validateEndpointFile(root, filePath),
  );
  const endpointsBySlug = bySlug(endpoints, "API endpoint");

  validateNavigation(path.join(apiRoot, "navigation.yaml"), "API navigation", endpointsBySlug, "endpoint");

  return endpoints.length;
}

function validateArticles(root) {
  const articlesRoot = path.join(root, "content", "articles");
  const pages = yamlFilePaths(path.join(articlesRoot, "pages"), "Article pages").map((filePath) =>
    validateArticleFile(root, filePath),
  );
  const pagesBySlug = bySlug(pages, "article");

  validateNavigation(path.join(articlesRoot, "navigation.yaml"), "article navigation", pagesBySlug, "article");

  return pages.length;
}

try {
  const { root } = parseArgs();
  const endpointCount = validateApi(root);
  const articleCount = validateArticles(root);

  console.log(`Content validation passed: ${endpointCount} API endpoint(s), ${articleCount} article(s).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
