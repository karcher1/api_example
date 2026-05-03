import { Fragment } from "react";
import type {
  AutoSectionId,
  DocsBlockPlacement,
  EndpointDoc,
  EndpointDocBlock,
  EndpointParameter,
  ParameterLocation,
  ResponseDoc,
  SchemaNode,
} from "@/lib/openapi";
import { getResponseStatusTone } from "@/lib/examples";
import { CodeBlock } from "@/components/CodeBlock";
import { MethodBadge } from "@/components/MethodBadge";
import { SafeMarkdown } from "@/components/SafeMarkdown";
import { SchemaTable } from "@/components/SchemaTable";

interface EndpointContentProps {
  endpoint: EndpointDoc;
}

const PARAMETER_TITLES: Record<ParameterLocation, string> = {
  header: "Header parameters",
  path: "Path parameters",
  query: "Query parameters",
  cookie: "Cookie parameters",
};

const PARAMETER_ORDER: ParameterLocation[] = ["header", "path", "query", "cookie"];
const DEFAULT_SECTION_ORDER: AutoSectionId[] = [
  "overview",
  "header-parameters",
  "path-parameters",
  "query-parameters",
  "cookie-parameters",
  "request-body",
  "responses",
];
const STATUS_LABELS = {
  stable: "Stable",
  beta: "Beta",
  deprecated: "Deprecated",
  draft: "Draft",
};

function parameterTypeLabel(parameter: EndpointParameter): string {
  const schema = parameter.schema;

  if (!schema) {
    return "unknown";
  }

  return [
    schema.type,
    schema.format,
    schema.nullable ? "nullable" : undefined,
  ].filter(Boolean).join(" | ");
}

function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

function schemaMetaChips(schema?: SchemaNode): string[] {
  if (!schema) {
    return [];
  }

  return [
    schema.enum?.length ? `enum: ${schema.enum.join(", ")}` : undefined,
    schema.default !== undefined ? `default: ${formatValue(schema.default)}` : undefined,
    schema.minimum !== undefined ? `min: ${schema.minimum}` : undefined,
    schema.maximum !== undefined ? `max: ${schema.maximum}` : undefined,
    schema.minLength !== undefined ? `min length: ${schema.minLength}` : undefined,
    schema.maxLength !== undefined ? `max length: ${schema.maxLength}` : undefined,
    schema.pattern ? `pattern: ${schema.pattern}` : undefined,
    schema.minItems !== undefined ? `min items: ${schema.minItems}` : undefined,
    schema.maxItems !== undefined ? `max items: ${schema.maxItems}` : undefined,
  ].filter((chip): chip is string => Boolean(chip));
}

function groupedParameters(parameters: EndpointParameter[]) {
  return PARAMETER_ORDER.map((location) => ({
    location,
    title: PARAMETER_TITLES[location],
    parameters: parameters.filter((parameter) => parameter.location === location),
  })).filter((group) => group.parameters.length > 0);
}

function ParametersList({ parameters }: { parameters: EndpointParameter[] }) {
  return (
    <div className="parameter-list">
      {parameters.map((parameter) => {
        const chips = schemaMetaChips(parameter.schema);

        return (
          <article className="parameter-row" key={`${parameter.location}-${parameter.name}`}>
            <div className="parameter-row-main">
              <div className="parameter-row-heading">
                <code>{parameter.name}</code>
                <span>{parameterTypeLabel(parameter)}</span>
              </div>
              <p>{parameter.description ?? "No description provided."}</p>
              {chips.length > 0 ? (
                <div className="parameter-meta-list">
                  {chips.map((chip) => (
                    <span className="schema-tree-chip" key={`${parameter.location}-${parameter.name}-${chip}`}>
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <span className={parameter.required ? "schema-required" : "schema-optional"}>
              {parameter.required ? "required" : "optional"}
            </span>
          </article>
        );
      })}
    </div>
  );
}

function DocsBlockView({ block }: { block: EndpointDocBlock }) {
  if (block.type === "notice") {
    return (
      <aside className={`docs-notice docs-notice-${block.tone ?? "info"}`} id={block.id}>
        {block.title ? <h3>{block.title}</h3> : null}
        {block.body ? <SafeMarkdown source={block.body} /> : null}
      </aside>
    );
  }

  if (block.type === "code") {
    const value = block.value ?? block.body ?? "";

    return (
      <section className="docs-block docs-block-code" id={block.id}>
        {block.title ? <h2>{block.title}</h2> : null}
        {block.body && block.value !== undefined ? <SafeMarkdown source={block.body} /> : null}
        <CodeBlock value={value} language={block.language ?? "text"} />
      </section>
    );
  }

  return (
    <section className="docs-block docs-block-text" id={block.id}>
      {block.title ? <h2>{block.title}</h2> : null}
      {block.body ? <SafeMarkdown source={block.body} /> : null}
    </section>
  );
}

function DocsBlocks({ endpoint, placement }: { endpoint: EndpointDoc; placement: DocsBlockPlacement }) {
  const blocks = endpoint.docs.blocks.filter((block) => block.placement === placement);

  if (!blocks.length) {
    return null;
  }

  return (
    <>
      {blocks.map((block) => (
        <DocsBlockView block={block} key={block.id} />
      ))}
    </>
  );
}

function OverviewSection({ endpoint }: EndpointContentProps) {
  return (
    <section className="overview-card" id="overview" aria-label="Endpoint overview">
      <div className="overview-command">
        <div className="overview-method">
          <MethodBadge method={endpoint.method} />
        </div>
        <div className="overview-path">
          <code>{endpoint.path}</code>
        </div>
        {endpoint.docs.status ? (
          <div className={`overview-status overview-status-${endpoint.docs.status}`}>
            <span className="overview-status-dot" aria-hidden="true" />
            <span>{STATUS_LABELS[endpoint.docs.status]}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ParameterSection({
  group,
}: {
  group: ReturnType<typeof groupedParameters>[number];
}) {
  return (
    <section className="docs-section docs-section-spacious" id={`${group.location}-parameters`}>
      <h2>{group.title}</h2>
      <ParametersList parameters={group.parameters} />
    </section>
  );
}

function RequestBodySection({ endpoint }: EndpointContentProps) {
  if (!endpoint.requestBody?.content.length) {
    return null;
  }

  const bodyContent = endpoint.requestBody.content[0];

  return (
    <section className="docs-section docs-section-spacious" id="request-body">
      <h2>Request body</h2>
      <SchemaTable
        schema={bodyContent.schema}
        rootLabel="body"
        variant="fieldList"
        initialExpansion="all"
      />
    </section>
  );
}

function ResponseSchema({ response }: { response: ResponseDoc }) {
  if (!response.content.length) {
    return <p className="empty-state">This response has no documented body.</p>;
  }

  const content = response.content[0];

  return (
    <SchemaTable
      schema={content.schema}
      rootLabel={`response ${response.status}`}
      variant="fieldList"
      chrome="embedded"
      initialExpansion="none"
      controlMode="inline-toggle"
    />
  );
}

function ResponseCard({ response }: { response: ResponseDoc }) {
  const tone = getResponseStatusTone(response);

  return (
    <details className="response-doc-card">
      <summary>
        <span className={`status-dot status-dot-${tone}`} aria-hidden="true" />
        <span className="response-doc-status">{response.status}</span>
        <span>{response.description ?? "Response"}</span>
      </summary>
      <div className="response-doc-content">
        <ResponseSchema response={response} />
      </div>
    </details>
  );
}

function ResponsesSection({ endpoint }: EndpointContentProps) {
  return (
    <section className="docs-section docs-section-spacious" id="responses">
      <h2>Responses</h2>
      <div className="response-doc-list">
        {endpoint.responses.length ? (
          endpoint.responses.map((response) => <ResponseCard response={response} key={response.status} />)
        ) : (
          <p className="empty-state">No responses documented.</p>
        )}
      </div>
    </section>
  );
}

function orderedSectionIds(endpoint: EndpointDoc, sections: Map<AutoSectionId, JSX.Element>): AutoSectionId[] {
  const configured = endpoint.docs.sectionOrder.filter((sectionId) => sections.has(sectionId));
  const remaining = DEFAULT_SECTION_ORDER.filter((sectionId) => sections.has(sectionId) && !configured.includes(sectionId));

  return [...configured, ...remaining];
}

export function EndpointContent({ endpoint }: EndpointContentProps) {
  const parameterGroups = groupedParameters(endpoint.parameters);
  const sections = new Map<AutoSectionId, JSX.Element>();

  sections.set("overview", <OverviewSection endpoint={endpoint} />);

  parameterGroups.forEach((group) => {
    sections.set(`${group.location}-parameters` as AutoSectionId, <ParameterSection group={group} />);
  });

  if (endpoint.requestBody?.content.length) {
    sections.set("request-body", <RequestBodySection endpoint={endpoint} />);
  }

  sections.set("responses", <ResponsesSection endpoint={endpoint} />);

  return (
    <article className="endpoint-content">
      <header className="endpoint-hero">
        <h1>{endpoint.title}</h1>
        {endpoint.description ? <p>{endpoint.description}</p> : null}
      </header>

      <DocsBlocks endpoint={endpoint} placement="hero-after-description" />

      {orderedSectionIds(endpoint, sections).map((sectionId) => (
        <Fragment key={sectionId}>
          <DocsBlocks endpoint={endpoint} placement={`before:${sectionId}`} />
          {sections.get(sectionId)}
          <DocsBlocks endpoint={endpoint} placement={`after:${sectionId}`} />
        </Fragment>
      ))}

      <DocsBlocks endpoint={endpoint} placement="end" />
    </article>
  );
}
