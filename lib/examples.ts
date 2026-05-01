import type { EndpointDoc, EndpointParameter, ResponseDoc } from "@/lib/openapi";
import { getOpenApiDocument } from "@/lib/openapi";

interface PrimaryResponseExample {
  status: string;
  description?: string;
  contentType?: string;
  example?: unknown;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getBaseUrl(): string {
  const document = getOpenApiDocument();
  const servers = Array.isArray(document.servers) ? document.servers : [];
  const firstServer = servers.find(isRecord);

  return asString(firstServer?.url) ?? "https://api.example.com";
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function parameterValue(parameter: EndpointParameter): string {
  if (parameter.example !== undefined && parameter.example !== null) {
    return String(parameter.example);
  }

  if (parameter.schema?.example !== undefined && parameter.schema.example !== null) {
    return String(parameter.schema.example);
  }

  if (parameter.schema?.type === "integer" || parameter.schema?.type === "number") {
    return "1";
  }

  if (parameter.schema?.type === "boolean") {
    return "true";
  }

  return `{${parameter.name}}`;
}

function requestBodyExample(endpoint: EndpointDoc): unknown {
  if (endpoint.examples.request !== undefined) {
    return endpoint.examples.request;
  }

  return endpoint.requestBody?.content.find((content) => content.example !== undefined)?.example;
}

function withPathParameters(endpoint: EndpointDoc): string {
  return endpoint.parameters
    .filter((parameter) => parameter.location === "path")
    .reduce(
      (currentPath, parameter) =>
        currentPath.replace(`{${parameter.name}}`, encodeURIComponent(parameterValue(parameter))),
      endpoint.path,
    );
}

function withQueryParameters(endpoint: EndpointDoc, url: string): string {
  const query = endpoint.parameters
    .filter((parameter) => parameter.location === "query")
    .map((parameter) => `${encodeURIComponent(parameter.name)}=${encodeURIComponent(parameterValue(parameter))}`);

  if (!query.length) {
    return url;
  }

  return `${url}?${query.join("&")}`;
}

export function buildCurlExample(endpoint: EndpointDoc): string {
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const path = withPathParameters(endpoint);
  const url = withQueryParameters(endpoint, `${baseUrl}${path}`);
  const body = requestBodyExample(endpoint);
  const args = [
    `--request ${endpoint.method.toUpperCase()}`,
    `--url ${shellQuote(url)}`,
    "--header 'accept: application/json'",
  ];

  endpoint.parameters
    .filter((parameter) => parameter.location === "header")
    .forEach((parameter) => {
      args.push(`--header ${shellQuote(`${parameter.name}: ${parameterValue(parameter)}`)}`);
    });

  if (body !== undefined) {
    args.push("--header 'content-type: application/json'");
    args.push(`--data ${shellQuote(JSON.stringify(body, null, 2))}`);
  }

  return `curl ${args.join(" \\\n  ")}`;
}

export function getPrimaryResponseExample(endpoint: EndpointDoc): PrimaryResponseExample | undefined {
  const response =
    endpoint.responses.find((item) => item.status.startsWith("2")) ?? endpoint.responses[0];

  if (!response) {
    return undefined;
  }

  const content = response.content[0];

  return {
    status: response.status,
    description: response.description,
    contentType: content?.contentType,
    example: endpoint.examples.responses[response.status] ?? content?.example,
  };
}

export function getResponseStatusTone(response: ResponseDoc): "success" | "warning" | "error" {
  if (response.status.startsWith("2")) {
    return "success";
  }

  if (response.status.startsWith("4")) {
    return "warning";
  }

  return "error";
}
