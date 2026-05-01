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
  "trace",
] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export type ParameterLocation = "path" | "query" | "header" | "cookie";

export interface SchemaNode {
  name?: string;
  type: string;
  format?: string;
  required?: boolean;
  nullable?: boolean;
  description?: string;
  enum?: string[];
  example?: unknown;
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

export interface BodyContent {
  contentType: string;
  schema?: SchemaNode;
  example?: unknown;
}

export interface RequestBodyDoc {
  required: boolean;
  description?: string;
  content: BodyContent[];
}

export interface ResponseDoc {
  status: string;
  description?: string;
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
  description?: string;
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
  children: NavNode[];
}

type UnknownRecord = Record<string, unknown>;

const OPENAPI_PATH = path.join(process.cwd(), "content", "openapi.yaml");
const METHOD_ORDER = new Map(HTTP_METHODS.map((method, index) => [method, index]));

let documentCache: UnknownRecord | undefined;
let endpointCache: EndpointDoc[] | undefined;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHttpMethod(value: string): value is HttpMethod {
  return HTTP_METHODS.includes(value as HttpMethod);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
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

function pathToLabel(segment: string): string {
  if (segment.startsWith("{") && segment.endsWith("}")) {
    return `:${segment.slice(1, -1)}`;
  }

  return segment;
}

function pointerPart(value: string): string {
  return value.replace(/~1/g, "/").replace(/~0/g, "~");
}

function readJsonPointer(document: UnknownRecord, ref: string): unknown {
  if (!ref.startsWith("#/")) {
    throw new Error(`Only local OpenAPI refs are supported: ${ref}`);
  }

  return ref
    .slice(2)
    .split("/")
    .map(pointerPart)
    .reduce<unknown>((current, part) => {
      if (!isRecord(current)) {
        return undefined;
      }

      return current[part];
    }, document);
}

function resolveObject(value: unknown, document: UnknownRecord, seen = new Set<string>()): UnknownRecord {
  if (!isRecord(value)) {
    return {};
  }

  const ref = asString(value.$ref);
  if (!ref) {
    return value;
  }

  if (seen.has(ref)) {
    return {};
  }

  seen.add(ref);
  const target = resolveObject(readJsonPointer(document, ref), document, seen);
  const { $ref: _ref, ...overrides } = value;

  return { ...target, ...overrides };
}

function mergeSchemaRecords(base: UnknownRecord, next: UnknownRecord): UnknownRecord {
  const merged: UnknownRecord = { ...base, ...next };

  if (isRecord(base.properties) || isRecord(next.properties)) {
    merged.properties = {
      ...asRecord(base.properties),
      ...asRecord(next.properties),
    };
  }

  const required = [
    ...(Array.isArray(base.required) ? base.required : []),
    ...(Array.isArray(next.required) ? next.required : []),
  ].filter((item): item is string => typeof item === "string");

  if (required.length > 0) {
    merged.required = Array.from(new Set(required));
  }

  return merged;
}

function normalizeSchemaObject(
  schema: unknown,
  document: UnknownRecord,
  seen = new Set<string>(),
): UnknownRecord {
  const resolved = resolveObject(schema, document, seen);

  if (!Array.isArray(resolved.allOf)) {
    return resolved;
  }

  const allOfMerged = resolved.allOf
    .map((item) => normalizeSchemaObject(item, document, new Set(seen)))
    .reduce<UnknownRecord>(mergeSchemaRecords, {});

  const { allOf: _allOf, ...rest } = resolved;

  return mergeSchemaRecords(allOfMerged, rest);
}

function inferSchemaType(schema: UnknownRecord): string {
  if (typeof schema.type === "string") {
    return schema.type;
  }

  if (isRecord(schema.properties) || schema.additionalProperties) {
    return "object";
  }

  if (schema.items) {
    return "array";
  }

  if (Array.isArray(schema.oneOf)) {
    return "oneOf";
  }

  if (Array.isArray(schema.anyOf)) {
    return "anyOf";
  }

  return "unknown";
}

function schemaEnum(schema: UnknownRecord): string[] | undefined {
  if (!Array.isArray(schema.enum)) {
    return undefined;
  }

  return schema.enum.map(String);
}

export function toSchemaNode(
  name: string | undefined,
  schema: unknown,
  document = getOpenApiDocument(),
  required = false,
  depth = 0,
  seen = new Set<string>(),
): SchemaNode {
  if (depth > 10) {
    return {
      name,
      type: "object",
      required,
      description: "Nested schema truncated to avoid a circular reference.",
    };
  }

  const normalized = normalizeSchemaObject(schema, document, seen);
  const type = inferSchemaType(normalized);
  const requiredProperties = new Set(
    Array.isArray(normalized.required)
      ? normalized.required.filter((item): item is string => typeof item === "string")
      : [],
  );
  const variantsSource = Array.isArray(normalized.oneOf)
    ? normalized.oneOf
    : Array.isArray(normalized.anyOf)
      ? normalized.anyOf
      : undefined;

  const node: SchemaNode = {
    name,
    type,
    format: asString(normalized.format) || undefined,
    required,
    nullable: normalized.nullable === true,
    description: asString(normalized.description) || undefined,
    enum: schemaEnum(normalized),
    example: normalized.example,
  };

  if (isRecord(normalized.properties)) {
    node.properties = Object.entries(normalized.properties).map(([propertyName, propertySchema]) =>
      toSchemaNode(
        propertyName,
        propertySchema,
        document,
        requiredProperties.has(propertyName),
        depth + 1,
        new Set(seen),
      ),
    );
  }

  if (normalized.items) {
    node.items = toSchemaNode(undefined, normalized.items, document, false, depth + 1, new Set(seen));
  }

  if (variantsSource) {
    node.variants = variantsSource.map((variant, index) =>
      toSchemaNode(`Option ${index + 1}`, variant, document, false, depth + 1, new Set(seen)),
    );
  }

  if (normalized.additionalProperties && normalized.additionalProperties !== true) {
    node.additionalProperties = toSchemaNode(
      "additionalProperty",
      normalized.additionalProperties,
      document,
      false,
      depth + 1,
      new Set(seen),
    );
  }

  return node;
}

function exampleScalar(type: string, format?: unknown): unknown {
  if (type === "integer") {
    return 42;
  }

  if (type === "number") {
    return 42.5;
  }

  if (type === "boolean") {
    return true;
  }

  if (format === "date-time") {
    return "2026-05-01T12:00:00Z";
  }

  if (format === "date") {
    return "2026-05-01";
  }

  if (format === "email") {
    return "user@example.com";
  }

  if (format === "uuid") {
    return "018f9f3e-4c10-7a2a-9d2c-32b30f7f28a4";
  }

  return "string";
}

function exampleFromSchema(
  schema: unknown,
  document: UnknownRecord,
  depth = 0,
  seen = new Set<string>(),
): unknown {
  if (depth > 6) {
    return undefined;
  }

  const normalized = normalizeSchemaObject(schema, document, seen);

  if (normalized.example !== undefined) {
    return normalized.example;
  }

  if (normalized.default !== undefined) {
    return normalized.default;
  }

  if (Array.isArray(normalized.enum) && normalized.enum.length > 0) {
    return normalized.enum[0];
  }

  const type = inferSchemaType(normalized);

  if (type === "object") {
    const sample: UnknownRecord = {};

    if (isRecord(normalized.properties)) {
      Object.entries(normalized.properties).forEach(([propertyName, propertySchema]) => {
        sample[propertyName] = exampleFromSchema(propertySchema, document, depth + 1, new Set(seen));
      });
    }

    return sample;
  }

  if (type === "array") {
    return [exampleFromSchema(normalized.items, document, depth + 1, new Set(seen))];
  }

  if (Array.isArray(normalized.oneOf) && normalized.oneOf.length > 0) {
    return exampleFromSchema(normalized.oneOf[0], document, depth + 1, new Set(seen));
  }

  if (Array.isArray(normalized.anyOf) && normalized.anyOf.length > 0) {
    return exampleFromSchema(normalized.anyOf[0], document, depth + 1, new Set(seen));
  }

  return exampleScalar(type, normalized.format);
}

function readExample(mediaType: UnknownRecord, schema: unknown, document: UnknownRecord): unknown {
  if (mediaType.example !== undefined) {
    return mediaType.example;
  }

  if (isRecord(mediaType.examples)) {
    const firstExample = Object.values(mediaType.examples)[0];
    const resolved = resolveObject(firstExample, document);

    if (resolved.value !== undefined) {
      return resolved.value;
    }
  }

  if (schema !== undefined) {
    return exampleFromSchema(schema, document);
  }

  return undefined;
}

function parseBodyContent(content: unknown, document: UnknownRecord): BodyContent[] {
  if (!isRecord(content)) {
    return [];
  }

  return Object.entries(content).map(([contentType, mediaTypeValue]) => {
    const mediaType = resolveObject(mediaTypeValue, document);
    const schema = mediaType.schema;

    return {
      contentType,
      schema: schema ? toSchemaNode("body", schema, document, true) : undefined,
      example: readExample(mediaType, schema, document),
    };
  });
}

function parseParameters(
  pathParameters: unknown,
  operationParameters: unknown,
  document: UnknownRecord,
): EndpointParameter[] {
  const parameters = [
    ...(Array.isArray(pathParameters) ? pathParameters : []),
    ...(Array.isArray(operationParameters) ? operationParameters : []),
  ];

  return parameters.map((parameterValue) => {
    const parameter = resolveObject(parameterValue, document);
    const location = asString(parameter.in, "query") as ParameterLocation;
    const schema = parameter.schema;

    return {
      name: asString(parameter.name, "parameter"),
      location,
      required: asBoolean(parameter.required, location === "path"),
      description: asString(parameter.description) || undefined,
      schema: schema ? toSchemaNode(undefined, schema, document) : undefined,
      example: parameter.example ?? (schema ? exampleFromSchema(schema, document) : undefined),
    };
  });
}

function parseRequestBody(requestBodyValue: unknown, document: UnknownRecord): RequestBodyDoc | undefined {
  if (!requestBodyValue) {
    return undefined;
  }

  const requestBody = resolveObject(requestBodyValue, document);
  const content = parseBodyContent(requestBody.content, document);

  return {
    required: asBoolean(requestBody.required),
    description: asString(requestBody.description) || undefined,
    content,
  };
}

function parseResponses(responsesValue: unknown, document: UnknownRecord): ResponseDoc[] {
  if (!isRecord(responsesValue)) {
    return [];
  }

  return Object.entries(responsesValue).map(([status, responseValue]) => {
    const response = resolveObject(responseValue, document);

    return {
      status,
      description: asString(response.description) || undefined,
      content: parseBodyContent(response.content, document),
    };
  });
}

function getTagOrder(document: UnknownRecord): Map<string, number> {
  const tags = Array.isArray(document.tags) ? document.tags : [];

  return new Map(
    tags
      .map((tag, index) => [asString(asRecord(tag).name), index] as const)
      .filter(([tag]) => tag.length > 0),
  );
}

export function getOpenApiDocument(): UnknownRecord {
  if (documentCache) {
    return documentCache;
  }

  if (!fs.existsSync(OPENAPI_PATH)) {
    throw new Error(`OpenAPI file was not found at ${OPENAPI_PATH}`);
  }

  const file = fs.readFileSync(OPENAPI_PATH, "utf8");
  const parsed = parse(file);

  if (!isRecord(parsed)) {
    throw new Error("OpenAPI document must be a YAML object.");
  }

  documentCache = parsed;

  return documentCache;
}

export function getEndpoints(): EndpointDoc[] {
  if (endpointCache) {
    return endpointCache;
  }

  const document = getOpenApiDocument();
  const paths = asRecord(document.paths);
  const tagOrder = getTagOrder(document);
  const usedSlugs = new Map<string, number>();
  const endpoints: EndpointDoc[] = [];

  Object.entries(paths).forEach(([apiPath, pathItemValue]) => {
    const pathItem = resolveObject(pathItemValue, document);
    const pathParameters = pathItem.parameters;

    Object.entries(pathItem).forEach(([methodName, operationValue]) => {
      if (!isHttpMethod(methodName)) {
        return;
      }

      const operation = resolveObject(operationValue, document);
      const operationTags = Array.isArray(operation.tags) ? operation.tags : [];
      const tag = asString(operationTags[0], "General");
      const tagSlug = slugify(tag);
      const summary =
        asString(operation.summary) || `${methodName.toUpperCase()} ${apiPath}`;
      const operationId = asString(operation.operationId) || undefined;
      const baseSlug = slugify(operationId || summary || `${methodName}-${apiPath}`);
      const slugKey = `${tagSlug}/${baseSlug}`;
      const duplicateCount = usedSlugs.get(slugKey) ?? 0;
      const slug = duplicateCount === 0 ? baseSlug : `${baseSlug}-${duplicateCount + 1}`;
      const requestBody = parseRequestBody(operation.requestBody, document);
      const responses = parseResponses(operation.responses, document);
      const firstRequestExample = requestBody?.content.find((item) => item.example !== undefined)?.example;
      const responseExamples = responses.reduce<Record<string, unknown>>((examples, response) => {
        const example = response.content.find((item) => item.example !== undefined)?.example;

        if (example !== undefined) {
          examples[response.status] = example;
        }

        return examples;
      }, {});

      usedSlugs.set(slugKey, duplicateCount + 1);

      endpoints.push({
        id: `${methodName}:${apiPath}`,
        slug,
        slugParts: [tagSlug, slug],
        href: `/reference/${tagSlug}/${slug}`,
        method: methodName,
        path: apiPath,
        tag,
        tagSlug,
        operationId,
        summary,
        description: asString(operation.description) || undefined,
        parameters: parseParameters(pathParameters, operation.parameters, document),
        requestBody,
        responses,
        examples: {
          request: firstRequestExample,
          responses: responseExamples,
        },
      });
    });
  });

  endpointCache = endpoints.sort((a, b) => {
    const tagDelta =
      (tagOrder.get(a.tag) ?? Number.MAX_SAFE_INTEGER) -
      (tagOrder.get(b.tag) ?? Number.MAX_SAFE_INTEGER);

    if (tagDelta !== 0) {
      return tagDelta;
    }

    const pathDelta = a.path.localeCompare(b.path);

    if (pathDelta !== 0) {
      return pathDelta;
    }

    return (METHOD_ORDER.get(a.method) ?? 0) - (METHOD_ORDER.get(b.method) ?? 0);
  });

  return endpointCache;
}

export function getEndpointBySlug(slugParts: string[]): EndpointDoc | undefined {
  return getEndpoints().find((endpoint) => endpoint.slugParts.join("/") === slugParts.join("/"));
}

export function getEndpointStaticParams(): Array<{ slug: string[] }> {
  return getEndpoints().map((endpoint) => ({ slug: endpoint.slugParts }));
}

export function getFirstEndpointHref(): string {
  return getEndpoints()[0]?.href ?? "/guides";
}

function findOrCreateGroup(children: NavNode[], id: string, label: string): NavNode {
  const existing = children.find((node) => node.id === id);

  if (existing) {
    return existing;
  }

  const node: NavNode = {
    id,
    type: "group",
    label,
    children: [],
  };

  children.push(node);

  return node;
}

export function getEndpointNavigation(): NavNode[] {
  const roots: NavNode[] = [];

  getEndpoints().forEach((endpoint) => {
    const tagNode = findOrCreateGroup(roots, `tag:${endpoint.tagSlug}`, endpoint.tag);
    const pathSegments = endpoint.path.split("/").filter(Boolean);
    let current = tagNode;
    let pathId = `tag:${endpoint.tagSlug}`;

    pathSegments.forEach((segment) => {
      pathId = `${pathId}/${segment}`;
      current = findOrCreateGroup(current.children, pathId, pathToLabel(segment));
    });

    current.children.push({
      id: endpoint.id,
      type: "endpoint",
      label: endpoint.summary,
      href: endpoint.href,
      method: endpoint.method,
      path: endpoint.path,
      children: [],
    });
  });

  return roots;
}
