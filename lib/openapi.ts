import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

export const HTTP_METHODS = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];
export type ParameterLocation = "path" | "query" | "header" | "cookie";
export type DocsNoticeTone = "info" | "warning" | "danger" | "success" | "neutral";
export type AutoSectionId =
  | "overview"
  | "header-parameters"
  | "path-parameters"
  | "query-parameters"
  | "cookie-parameters"
  | "request-body"
  | "responses";
export type DocsBlockPlacement =
  | "hero-after-description"
  | `before:${AutoSectionId}`
  | `after:${AutoSectionId}`
  | "end";
export type DocsBlockType = "text" | "notice" | "code";

export interface EndpointCodeExample {
  id: string;
  label: string;
  language: string;
  value: string;
}

export interface EndpointDocBlock {
  id: string;
  type: DocsBlockType;
  placement: DocsBlockPlacement;
  title?: string;
  body?: string;
  tone?: DocsNoticeTone;
  language?: string;
  value?: unknown;
}

export interface EndpointDocs {
  status?: string;
  sectionOrder: AutoSectionId[];
  blocks: EndpointDocBlock[];
  requestExamples: EndpointCodeExample[];
  responseExamples: EndpointCodeExample[];
}

export interface SchemaNode {
  name?: string;
  type: string;
  format?: string;
  required?: boolean;
  nullable?: boolean;
  description?: string;
  enum?: string[];
  example?: unknown;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
  properties?: SchemaNode[];
  items?: SchemaNode;
  variants?: SchemaNode[];
  additionalProperties?: SchemaNode;
}

export interface EndpointParameter {
  name: string;
  location: ParameterLocation;
  required: boolean;
  description?: string;
  schema?: SchemaNode;
  example?: unknown;
}

interface RequestBodyParameter {
  name: string;
  required: boolean;
  description?: string;
  schema?: SchemaNode;
  example?: unknown;
}

export interface ResponseParameter {
  name: string;
  type: string;
  description?: string;
  schema?: SchemaNode;
}

export interface BodyContent {
  contentType: string;
  schema?: SchemaNode;
  example?: unknown;
  examples: unknown[];
}

export interface RequestBodyDoc {
  required: boolean;
  description?: string;
  content: BodyContent[];
}

export interface ResponseDoc {
  status: string;
  description?: string;
  parameters: ResponseParameter[];
  content: BodyContent[];
}

export interface EndpointDoc {
  id: string;
  slug: string;
  slugParts: string[];
  href: string;
  method: HttpMethod;
  path: string;
  tag: string;
  tagSlug: string;
  operationId?: string;
  summary: string;
  title: string;
  description?: string;
  docs: EndpointDocs;
  parameters: EndpointParameter[];
  requestBody?: RequestBodyDoc;
  responses: ResponseDoc[];
  examples: {
    request?: unknown;
    responses: Record<string, unknown>;
  };
}

export interface NavNode {
  id: string;
  type: "group" | "endpoint";
  label: string;
  href?: string;
  method?: HttpMethod;
  path?: string;
  defaultOpen?: boolean;
  children: NavNode[];
}

type UnknownRecord = Record<string, unknown>;

const API_ROOT = path.join(process.cwd(), "content", "api");
const API_NAVIGATION_PATH = path.join(API_ROOT, "navigation.yaml");
const API_ENDPOINTS_DIR = path.join(API_ROOT, "endpoints");
const PUBLIC_ROOT = path.join(process.cwd(), "public");
const DEFAULT_SECTION_ORDER: AutoSectionId[] = [
  "overview",
  "header-parameters",
  "path-parameters",
  "query-parameters",
  "request-body",
  "responses",
];
const KNOWN_BLOCK_TONES = new Set(["note", "info", "warning", "danger", "tip"]);

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
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
  throw new Error(`Invalid API content at ${filePath}: ${message}`);
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

function validateLocalPublicAssetSrc(src: string, filePath: string, location: string) {
  if (/^[a-z][a-z\d+.-]*:/i.test(src) || src.startsWith("//")) {
    return;
  }

  if (!src.startsWith("/")) {
    contentError(filePath, `${location} references local image "${src}". Use an absolute public path like /images/example.png.`);
  }

  const publicPath = path.normalize(path.join(PUBLIC_ROOT, src.replace(/^\/+/, "")));
  const publicRootWithSeparator = `${PUBLIC_ROOT}${path.sep}`;

  if (publicPath !== PUBLIC_ROOT && !publicPath.startsWith(publicRootWithSeparator)) {
    contentError(filePath, `${location} must stay inside the public directory.`);
  }

  if (!fs.existsSync(publicPath)) {
    contentError(filePath, `${location} references missing public asset "${src}" (expected ${publicPath}).`);
  }
}

function validateMarkdownLocalImageSrcs(source: string | undefined, filePath: string, location: string) {
  if (!source) {
    return;
  }

  const imagePattern = /!\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  let match: RegExpExecArray | null;

  while ((match = imagePattern.exec(source)) !== null) {
    validateLocalPublicAssetSrc(match[1] ?? "", filePath, `${location} Markdown image`);
  }
}

export function slugify(value: string): string {
  const slug = value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "untitled";
}

function methodFromContent(value: unknown, filePath: string): HttpMethod {
  const method = asString(value).toLowerCase();

  if (!HTTP_METHODS.includes(method as HttpMethod)) {
    contentError(filePath, `method must be one of ${HTTP_METHODS.map((item) => item.toUpperCase()).join(", ")}.`);
  }

  return method as HttpMethod;
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

function parseSchemaNode(
  record: UnknownRecord,
  filePath: string,
  location: string,
  required = false,
): SchemaNode {
  const name = optionalString(record, "name");
  const type = requireString(record, "type", filePath);
  const children = ensureArray(record.children, `${location}.children`, filePath);
  const node: SchemaNode = {
    name,
    type,
    required,
    description: optionalString(record, "description"),
    example: record.example,
    default: record.default,
  };

  if (type === "array" && isRecord(record.items)) {
    node.items = parseSchemaNode(record.items, filePath, `${location}.items`);
  }

  if (children.length > 0) {
    node.properties = children.map((child, index) => {
      if (!isRecord(child)) {
        contentError(filePath, `${location}.children[${index}] must be an object.`);
      }

      return parseSchemaNode(
        child,
        filePath,
        `${location}.children[${index}]`,
        asBoolean(child.required),
      );
    });
  }

  return node;
}

function parseParameterRecord(value: unknown, field: string, index: number, filePath: string): RequestBodyParameter {
  if (!isRecord(value)) {
    contentError(filePath, `${field}[${index}] must be an object.`);
  }

  if (typeof value.required !== "boolean") {
    contentError(filePath, `${field}[${index}].required must be a boolean.`);
  }

  const name = requireString(value, "name", filePath);
  const description = requireString(value, "description", filePath);
  const schema = parseSchemaNode(value, filePath, `${field}[${index}]`, value.required);

  return {
    name,
    required: value.required,
    description,
    schema,
    example: value.example,
  };
}

function parseRequestBodyParameterGroup(value: unknown, field: string, filePath: string): RequestBodyParameter[] {
  return ensureArray(value, field, filePath).map((parameterValue, index) =>
    parseParameterRecord(parameterValue, field, index, filePath),
  );
}

function parseParameterGroup(
  value: unknown,
  field: string,
  location: ParameterLocation,
  filePath: string,
): EndpointParameter[] {
  return ensureArray(value, field, filePath).map((parameterValue, index) => {
    const parameter = parseParameterRecord(parameterValue, field, index, filePath);

    return {
      name: parameter.name,
      location,
      required: parameter.required,
      description: parameter.description,
      schema: parameter.schema,
      example: parameter.example,
    };
  });
}

function requestBodySchema(parameters: RequestBodyParameter[]): SchemaNode | undefined {
  if (!parameters.length) {
    return undefined;
  }

  return {
    name: "body",
    type: "object",
    required: true,
    properties: parameters.map((parameter) => ({
      name: parameter.name,
      type: parameter.schema?.type ?? "unknown",
      required: parameter.required,
      description: parameter.description,
      example: parameter.example,
      default: parameter.schema?.default,
      properties: parameter.schema?.properties,
      items: parameter.schema?.items,
    })),
  };
}

function parseResponses(value: unknown, filePath: string): ResponseDoc[] {
  return ensureArray(value, "responses", filePath).map((responseValue, index) => {
    if (!isRecord(responseValue)) {
      contentError(filePath, `responses[${index}] must be an object.`);
    }

    const status = requireString(responseValue, "status", filePath);
    const description = requireString(responseValue, "description", filePath);
    const parameters = ensureArray(responseValue.parameters, `responses[${index}].parameters`, filePath).map(
      (parameterValue, parameterIndex) => {
        if (!isRecord(parameterValue)) {
          contentError(filePath, `responses[${index}].parameters[${parameterIndex}] must be an object.`);
        }

        const name = requireString(parameterValue, "name", filePath);
        const description = requireString(parameterValue, "description", filePath);
        const schema = parseSchemaNode(parameterValue, filePath, `responses[${index}].parameters[${parameterIndex}]`);

        return {
          name,
          type: schema.type,
          description,
          schema,
        };
      },
    );
    const schema: SchemaNode | undefined = parameters.length
      ? {
          name: `response ${status}`,
          type: "object",
          properties: parameters.map((parameter) => ({
            name: parameter.name,
            type: parameter.schema?.type ?? parameter.type,
            description: parameter.description,
            properties: parameter.schema?.properties,
            items: parameter.schema?.items,
          })),
        }
      : undefined;

    return {
      status,
      description,
      parameters,
      content: schema
        ? [
            {
              contentType: "application/json",
              schema,
              examples: [],
            },
          ]
        : [],
    };
  });
}

function blockTone(type: string): DocsNoticeTone {
  if (type === "warning" || type === "danger" || type === "info") {
    return type;
  }

  if (type === "tip") {
    return "success";
  }

  return "neutral";
}

function parseBlocks(value: unknown, filePath: string): EndpointDocBlock[] {
  return ensureArray(value, "blocks", filePath).map((blockValue, index) => {
    if (!isRecord(blockValue)) {
      contentError(filePath, `blocks[${index}] must be an object.`);
    }

    const type = requireString(blockValue, "type", filePath);
    const title = optionalString(blockValue, "title");
    const body = requireString(blockValue, "content", filePath);

    validateMarkdownLocalImageSrcs(body, filePath, `blocks[${index}].content`);

    return {
      id: slugify(title || `${type}-${index + 1}`),
      type: "notice",
      placement: "end",
      title,
      body,
      tone: blockTone(type),
    };
  });
}

function parseExamples(value: unknown, field: string, filePath: string): EndpointCodeExample[] {
  const seenLabels = new Map<string, number>();
  const seenIds = new Map<string, string>();

  return ensureArray(value, field, filePath).map((exampleValue, index) => {
    if (!isRecord(exampleValue)) {
      contentError(filePath, `${field}[${index}] must be an object.`);
    }

    const label = requireString(exampleValue, "label", filePath);
    const normalizedLabel = label.toLowerCase();
    const id = slugify(label);
    const previousLabelIndex = seenLabels.get(normalizedLabel);
    const previousIdLabel = seenIds.get(id);

    if (previousLabelIndex !== undefined) {
      contentError(filePath, `${field}[${index}].label duplicates ${field}[${previousLabelIndex}].label.`);
    }

    if (previousIdLabel) {
      contentError(filePath, `${field}[${index}].label "${label}" generates duplicate selector id "${id}" with "${previousIdLabel}".`);
    }

    seenLabels.set(normalizedLabel, index);
    seenIds.set(id, label);

    return {
      id,
      label,
      language: requireString(exampleValue, "language", filePath),
      value: requireString(exampleValue, "code", filePath),
    };
  });
}

function endpointFilePaths(): string[] {
  if (!fs.existsSync(API_ENDPOINTS_DIR)) {
    throw new Error(`API endpoints directory was not found at ${API_ENDPOINTS_DIR}.`);
  }

  return fs
    .readdirSync(API_ENDPOINTS_DIR)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .sort()
    .map((file) => path.join(API_ENDPOINTS_DIR, file));
}

function endpointFromFile(filePath: string): EndpointDoc {
  const document = readYamlObject(filePath, "API endpoint file");
  const slug = requireString(document, "slug", filePath);
  const title = requireString(document, "title", filePath);
  const description = requireString(document, "description", filePath);
  const method = methodFromContent(document.method, filePath);
  const endpointPath = requireString(document, "path", filePath);
  const status = requireString(document, "status", filePath);

  validateSlugMatchesFile(slug, filePath);
  validateMarkdownLocalImageSrcs(description, filePath, "description");

  if (!endpointPath.startsWith("/")) {
    contentError(filePath, "path must start with /.");
  }

  const headerParameters = parseParameterGroup(document.headerParameters, "headerParameters", "header", filePath);
  const pathParameters = parseParameterGroup(document.pathParameters, "pathParameters", "path", filePath);
  const queryParameters = parseParameterGroup(document.queryParameters, "queryParameters", "query", filePath);
  const requestBodyParameters = parseRequestBodyParameterGroup(
    document.requestBodyParameters,
    "requestBodyParameters",
    filePath,
  );
  const requestBodySchemaValue = requestBodySchema(requestBodyParameters);
  const requestBody = requestBodySchemaValue
    ? {
        required: requestBodyParameters.some((parameter) => parameter.required),
        content: [
          {
            contentType: "application/json",
            schema: requestBodySchemaValue,
            examples: [],
          },
        ],
      }
    : undefined;
  const responses = parseResponses(document.responses, filePath);
  const requestExamples = parseExamples(document.requestExamples, "requestExamples", filePath);
  const responseExamples = parseExamples(document.responseExamples, "responseExamples", filePath);

  return {
    id: slug,
    slug,
    slugParts: [slug],
    href: `/api/${slug}`,
    method,
    path: endpointPath,
    tag: "API Reference",
    tagSlug: "api",
    operationId: slug,
    summary: title,
    title,
    description,
    docs: {
      status,
      sectionOrder: DEFAULT_SECTION_ORDER,
      blocks: parseBlocks(document.blocks, filePath),
      requestExamples,
      responseExamples,
    },
    parameters: [...headerParameters, ...pathParameters, ...queryParameters],
    requestBody,
    responses,
    examples: {
      request: requestExamples[0]?.value,
      responses: Object.fromEntries(responseExamples.map((example) => [example.label, example.value])),
    },
  };
}

export function getEndpoints(): EndpointDoc[] {
  const seen = new Map<string, string>();
  const endpoints: EndpointDoc[] = [];

  endpointFilePaths().forEach((filePath) => {
    const endpoint = endpointFromFile(filePath);
    const existing = seen.get(endpoint.slug);

    if (existing) {
      throw new Error(
        `Duplicate API endpoint slug "${endpoint.slug}" in ${existing} and ${filePath}.`,
      );
    }

    seen.set(endpoint.slug, filePath);
    endpoints.push(endpoint);
  });

  return endpoints;
}

export function getEndpointBySlug(slugParts: string[]): EndpointDoc | undefined {
  const slug = slugParts[slugParts.length - 1];

  return getEndpoints().find((endpoint) => endpoint.slug === slug);
}

export function getEndpointStaticParams(): Array<{ slug: string }> {
  return getEndpoints().map((endpoint) => ({ slug: endpoint.slug }));
}

function navError(message: string): never {
  throw new Error(`Invalid API navigation at ${API_NAVIGATION_PATH}: ${message}`);
}

function endpointNavNode(endpoint: EndpointDoc, label?: string): NavNode {
  return {
    id: `endpoint:${endpoint.slug}`,
    type: "endpoint",
    label: label || endpoint.title,
    href: endpoint.href,
    method: endpoint.method,
    path: endpoint.path,
    children: [],
  };
}

function parseNavItems(
  value: unknown,
  endpointsBySlug: Map<string, EndpointDoc>,
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

    const children = itemValue.items;
    const slug = asString(itemValue.slug).trim();

    if (slug) {
      if (itemValue.items !== undefined) {
        navError(`${itemLocation} cannot define both slug and items.`);
      }

      const endpoint = endpointsBySlug.get(slug);

      if (!endpoint) {
        navError(`${itemLocation}.slug references missing endpoint "${slug}".`);
      }

      if (placedSlugs.has(slug)) {
        navError(`Endpoint slug "${slug}" is listed more than once in navigation.`);
      }

      placedSlugs.add(slug);

      return endpointNavNode(endpoint, optionalString(itemValue, "title"));
    }

    const id = requireString(itemValue, "id", API_NAVIGATION_PATH);
    const label = requireString(itemValue, "title", API_NAVIGATION_PATH);

    if (groupIds.has(id)) {
      navError(`Group id "${id}" is used more than once.`);
    }

    groupIds.add(id);

    return {
      id,
      type: "group",
      label,
      defaultOpen: itemValue.defaultOpen !== false,
      children: parseNavItems(children, endpointsBySlug, placedSlugs, groupIds, `${itemLocation}.items`),
    };
  });
}

function readNavigationDocument(): UnknownRecord {
  const document = readYamlObject(API_NAVIGATION_PATH, "API navigation file");

  if (!Array.isArray(document.sections)) {
    navError("sections must be an array.");
  }

  if (document.sections.length === 0) {
    navError("sections must contain at least one section.");
  }

  return document;
}

function endpointsBySlug(endpoints: EndpointDoc[]): Map<string, EndpointDoc> {
  return new Map(endpoints.map((endpoint) => [endpoint.slug, endpoint]));
}

function firstEndpointInNavigation(nodes: NavNode[]): NavNode | undefined {
  for (const node of nodes) {
    if (node.type === "endpoint") {
      return node;
    }

    const child = firstEndpointInNavigation(node.children);

    if (child) {
      return child;
    }
  }

  return undefined;
}

export function getEndpointNavigationTitle(): string {
  const document = readNavigationDocument();

  return optionalString(document, "title") ?? "API Reference";
}

export function getEndpointNavigation(): NavNode[] {
  const endpoints = getEndpoints();
  const document = readNavigationDocument();
  const placedSlugs = new Set<string>();
  const groupIds = new Set<string>();

  return parseNavItems(document.sections, endpointsBySlug(endpoints), placedSlugs, groupIds, "sections");
}

export function getFirstEndpointHref(): string {
  const navigationFirst = firstEndpointInNavigation(getEndpointNavigation());

  if (navigationFirst?.href) {
    return navigationFirst.href;
  }

  const endpoint = getEndpoints()[0];

  return endpoint?.href ?? "/";
}
