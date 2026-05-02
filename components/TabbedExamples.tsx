"use client";

import { useState } from "react";
import type { EndpointCodeExample } from "@/lib/openapi";
import type { ResponseExample } from "@/lib/examples";
import { CodeBlock } from "@/components/CodeBlock";

interface TabbedExamplesProps {
  requestExamples: EndpointCodeExample[];
  responseExamples: ResponseExample[];
}

interface ExampleSelectOption {
  id: string;
  label: string;
}

interface ExampleSelectProps {
  ariaLabel: string;
  value?: string;
  options: ExampleSelectOption[];
  onChange: (value: string) => void;
}

function ExampleSelect({ ariaLabel, value, options, onChange }: ExampleSelectProps) {
  if (options.length <= 1) {
    return null;
  }

  return (
    <div className="example-select-wrap">
      <select
        aria-label={ariaLabel}
        className="example-select"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option value={option.id} key={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TabbedExamples({ requestExamples, responseExamples }: TabbedExamplesProps) {
  const [activeRequestId, setActiveRequestId] = useState(requestExamples[0]?.id);
  const [activeResponseId, setActiveResponseId] = useState(
    responseExamples.find((example) => example.status.startsWith("2"))?.id ?? responseExamples[0]?.id,
  );
  const activeRequest = requestExamples.find((example) => example.id === activeRequestId) ?? requestExamples[0];
  const activeResponse = responseExamples.find((example) => example.id === activeResponseId) ?? responseExamples[0];
  const requestOptions = requestExamples.map((example) => ({
    id: example.id,
    label: example.label,
  }));
  const responseOptions = responseExamples.map((example) => ({
    id: example.id,
    label: example.status === example.label ? example.status : `${example.status} ${example.label}`,
  }));

  return (
    <div className="right-panel examples-panel">
      <section className="example-card">
        <div className="example-card-header">
          <div className="example-card-title">
            <span>Request</span>
          </div>
          <ExampleSelect
            ariaLabel="Select request example"
            value={activeRequest?.id}
            options={requestOptions}
            onChange={setActiveRequestId}
          />
        </div>
        {activeRequest ? <CodeBlock value={activeRequest.value} language={activeRequest.language} /> : null}
      </section>

      <section className="example-card">
        <div className="example-card-header">
          <div className="example-card-title">
            <span>Response</span>
          </div>
          <ExampleSelect
            ariaLabel="Select response example"
            value={activeResponse?.id}
            options={responseOptions}
            onChange={setActiveResponseId}
          />
        </div>
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
