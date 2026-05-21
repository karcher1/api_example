import type { EndpointCodeExample, EndpointDoc, ResponseDoc } from "@/lib/openapi";

export interface ResponseExample {
  id: string;
  label: string;
  language: string;
  value: string;
}

export function getRequestExamples(endpoint: EndpointDoc): EndpointCodeExample[] {
  return endpoint.docs.requestExamples;
}

export function getResponseExamples(endpoint: EndpointDoc): ResponseExample[] {
  return endpoint.docs.responseExamples;
}

export function getPrimaryResponseExample(endpoint: EndpointDoc): ResponseExample | undefined {
  return getResponseExamples(endpoint)[0];
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
