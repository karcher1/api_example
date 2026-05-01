"use client";

import { useMemo, useState } from "react";
import type { BodyContent, EndpointDoc, ResponseDoc } from "@/lib/openapi";
import { CodeBlock } from "@/components/CodeBlock";
import { MethodBadge } from "@/components/MethodBadge";
import { SchemaTree } from "@/components/SchemaTree";

interface RightPanelProps {
  endpoint: EndpointDoc;
}

type PanelTab = "request" | "response" | "examples";

function hasExamples(endpoint: EndpointDoc): boolean {
  return Boolean(endpoint.examples.request || Object.keys(endpoint.examples.responses).length > 0);
}

function contentLabel(content: BodyContent): string {
  return content.contentType || "application/json";
}

function RequestPanel({ endpoint }: RightPanelProps) {
  const body = endpoint.requestBody?.content[0];

  return (
    <div className="panel-stack">
      <div className="request-line">
        <MethodBadge method={endpoint.method} compact />
        <code>{endpoint.path}</code>
      </div>
      {endpoint.parameters.length ? (
        <div className="side-section">
          <h3>Parameters</h3>
          <div className="side-list">
            {endpoint.parameters.map((parameter) => (
              <div key={`${parameter.location}-${parameter.name}`} className="side-list-row">
                <span>{parameter.name}</span>
                <small>{parameter.location}</small>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {body ? (
        <div className="side-section">
          <h3>Body</h3>
          <p className="side-muted">{contentLabel(body)}</p>
          <SchemaTree schema={body.schema} compact />
          {body.example !== undefined ? <CodeBlock value={body.example} /> : null}
        </div>
      ) : (
        <p className="empty-state">This endpoint does not document a request body.</p>
      )}
    </div>
  );
}

function ResponseBlock({ response }: { response: ResponseDoc }) {
  const content = response.content[0];

  return (
    <div className="response-block">
      <div className="response-heading">
        <span className="status-pill">{response.status}</span>
        {response.description ? <span>{response.description}</span> : null}
      </div>
      {content ? (
        <div className="side-section">
          <p className="side-muted">{contentLabel(content)}</p>
          <SchemaTree schema={content.schema} compact />
          {content.example !== undefined ? <CodeBlock value={content.example} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function ResponsesPanel({ endpoint }: RightPanelProps) {
  if (!endpoint.responses.length) {
    return <p className="empty-state">No responses documented.</p>;
  }

  return (
    <div className="panel-stack">
      {endpoint.responses.map((response) => (
        <ResponseBlock key={response.status} response={response} />
      ))}
    </div>
  );
}

function ExamplesPanel({ endpoint }: RightPanelProps) {
  if (!hasExamples(endpoint)) {
    return <p className="empty-state">No examples documented.</p>;
  }

  return (
    <div className="panel-stack">
      {endpoint.examples.request !== undefined ? (
        <div className="side-section">
          <h3>Request example</h3>
          <CodeBlock value={endpoint.examples.request} />
        </div>
      ) : null}
      {Object.entries(endpoint.examples.responses).map(([status, example]) => (
        <div className="side-section" key={status}>
          <h3>{status} response</h3>
          <CodeBlock value={example} />
        </div>
      ))}
    </div>
  );
}

export function RightPanel({ endpoint }: RightPanelProps) {
  const tabs = useMemo(
    () =>
      [
        { id: "request" as const, label: "Request", enabled: true },
        { id: "response" as const, label: "Response", enabled: endpoint.responses.length > 0 },
        { id: "examples" as const, label: "Examples", enabled: hasExamples(endpoint) },
      ].filter((tab) => tab.enabled),
    [endpoint],
  );
  const [activeTab, setActiveTab] = useState<PanelTab>(tabs[0]?.id ?? "request");

  return (
    <div className="right-panel">
      <div className="panel-tabs" role="tablist" aria-label="Request and response details">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "panel-tab panel-tab-active" : "panel-tab"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="panel-content">
        {activeTab === "request" ? <RequestPanel endpoint={endpoint} /> : null}
        {activeTab === "response" ? <ResponsesPanel endpoint={endpoint} /> : null}
        {activeTab === "examples" ? <ExamplesPanel endpoint={endpoint} /> : null}
      </div>
    </div>
  );
}
