"use client";

import { useState } from "react";
import { Copy, Terminal } from "lucide-react";
import type { EndpointDoc } from "@/lib/openapi";
import { getRequestExamples, getResponseExamples } from "@/lib/examples";
import { CodeBlock } from "@/components/CodeBlock";
import { MethodBadge } from "@/components/MethodBadge";

interface RightPanelProps {
  endpoint: EndpointDoc;
}

export function RightPanel({ endpoint }: RightPanelProps) {
  const requestExamples = getRequestExamples(endpoint);
  const responseExamples = getResponseExamples(endpoint);
  const [activeRequestId, setActiveRequestId] = useState(requestExamples[0]?.id);
  const [activeResponseId, setActiveResponseId] = useState(
    responseExamples.find((example) => example.status.startsWith("2"))?.id ?? responseExamples[0]?.id,
  );
  const activeRequest = requestExamples.find((example) => example.id === activeRequestId) ?? requestExamples[0];
  const activeResponse = responseExamples.find((example) => example.id === activeResponseId) ?? responseExamples[0];

  return (
    <div className="right-panel examples-panel">
      <section className="example-card">
        <div className="example-card-header">
          <div>
            <span>Request</span>
            <h3>{activeRequest?.label ?? "Request"} Example</h3>
          </div>
          <div className="example-card-actions">
            <span className="example-chip">
              <Terminal size={13} aria-hidden="true" />
              {activeRequest?.language ?? "text"}
            </span>
            <button type="button" className="example-icon-button" aria-label="Copy request example">
              <Copy size={14} />
            </button>
          </div>
        </div>
        {requestExamples.length > 1 ? (
          <div className="example-tabs" aria-label="Request examples">
            {requestExamples.map((example) => (
              <button
                type="button"
                className={example.id === activeRequest?.id ? "example-tab example-tab-active" : "example-tab"}
                onClick={() => setActiveRequestId(example.id)}
                key={example.id}
              >
                {example.label}
              </button>
            ))}
          </div>
        ) : null}
        {activeRequest ? <CodeBlock value={activeRequest.value} language={activeRequest.language} /> : null}
      </section>

      <section className="example-card">
        <div className="example-card-header">
          <div>
            <span>Response</span>
            <h3>{activeResponse?.label ?? "JSON"} Response</h3>
          </div>
          <div className="example-card-actions">
            {activeResponse ? (
              <span className="response-code-chip">
                <MethodBadge method={endpoint.method} compact />
                {activeResponse.status}
              </span>
            ) : null}
            <button type="button" className="example-icon-button" aria-label="Copy response example">
              <Copy size={14} />
            </button>
          </div>
        </div>
        {responseExamples.length > 1 ? (
          <div className="example-tabs" aria-label="Response examples">
            {responseExamples.map((example) => (
              <button
                type="button"
                className={example.id === activeResponse?.id ? "example-tab example-tab-active" : "example-tab"}
                onClick={() => setActiveResponseId(example.id)}
                key={example.id}
              >
                {example.status === example.label ? example.status : `${example.status} ${example.label}`}
              </button>
            ))}
          </div>
        ) : null}
        {activeResponse?.description ? <p className="example-copy">{activeResponse.description}</p> : null}
        {activeResponse?.contentType ? <p className="content-type-label">{activeResponse.contentType}</p> : null}
        {activeResponse?.example !== undefined ? (
          <CodeBlock value={activeResponse.example} language="json" />
        ) : (
          <p className="empty-state">No response example documented.</p>
        )}
      </section>
    </div>
  );
}
