"use client";

import { useEffect, useState } from "react";
import type { EndpointCodeExample } from "@/lib/openapi";
import type { ResponseExample } from "@/lib/examples";
import { CodeBlock } from "@/components/CodeBlock";

interface TabbedExamplesProps {
  requestExamples: EndpointCodeExample[];
  responseExamples: ResponseExample[];
}

interface CodeExample {
  id: string;
  label: string;
  language: string;
  value: string;
}

interface ExampleCardProps {
  title: string;
  examples: CodeExample[];
  ariaLabel: string;
  emptyState: string;
}

interface SingleExamplePanelProps {
  title?: string;
  examples: CodeExample[];
  ariaLabel?: string;
  emptyState?: string;
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

function ExampleCard({ title, examples, ariaLabel, emptyState }: ExampleCardProps) {
  const [activeId, setActiveId] = useState(examples[0]?.id);
  const activeExample = examples.find((example) => example.id === activeId) ?? examples[0];
  const options = examples.map((example) => ({
    id: example.id,
    label: example.label,
  }));

  useEffect(() => {
    setActiveId(examples[0]?.id);
  }, [examples]);

  return (
    <section className="example-card">
      <div className="example-card-header">
        <div className="example-card-title">
          <span>{title}</span>
        </div>
        <ExampleSelect
          ariaLabel={ariaLabel}
          value={activeExample?.id}
          options={options}
          onChange={setActiveId}
        />
      </div>
      {activeExample ? (
        <CodeBlock value={activeExample.value} language={activeExample.language} />
      ) : (
        <p className="empty-state">{emptyState}</p>
      )}
    </section>
  );
}

export function TabbedExamples({ requestExamples, responseExamples }: TabbedExamplesProps) {
  return (
    <div className="right-panel examples-panel">
      <ExampleCard
        title="Request"
        examples={requestExamples}
        ariaLabel="Select request example"
        emptyState="No request example documented."
      />
      <ExampleCard
        title="Response"
        examples={responseExamples}
        ariaLabel="Select response example"
        emptyState="No response example documented."
      />
    </div>
  );
}

export function SingleExamplePanel({
  title = "Response",
  examples,
  ariaLabel = "Select response example",
  emptyState = "No response example documented.",
}: SingleExamplePanelProps) {
  return (
    <div className="right-panel examples-panel">
      <ExampleCard
        title={title}
        examples={examples}
        ariaLabel={ariaLabel}
        emptyState={emptyState}
      />
    </div>
  );
}
