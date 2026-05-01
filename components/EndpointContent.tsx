import type { BodyContent, EndpointDoc, EndpointParameter, ParameterLocation, ResponseDoc } from "@/lib/openapi";
import { getResponseStatusTone } from "@/lib/examples";
import { MethodBadge } from "@/components/MethodBadge";
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

function schemaTypeLabel(parameter: EndpointParameter): string {
  const schema = parameter.schema;

  if (!schema) {
    return "unknown";
  }

  return [schema.type, schema.format].filter(Boolean).join(" / ");
}

function contentLabel(content: BodyContent): string {
  return content.contentType || "application/json";
}

function groupedParameters(parameters: EndpointParameter[]) {
  return PARAMETER_ORDER.map((location) => ({
    location,
    title: PARAMETER_TITLES[location],
    parameters: parameters.filter((parameter) => parameter.location === location),
  })).filter((group) => group.parameters.length > 0);
}

function ParametersTable({ parameters }: { parameters: EndpointParameter[] }) {
  return (
    <div className="parameter-table-wrap">
      <table className="parameter-table">
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Requirement</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((parameter) => (
            <tr key={`${parameter.location}-${parameter.name}`}>
              <td>
                <code>{parameter.name}</code>
                <span>{schemaTypeLabel(parameter)}</span>
              </td>
              <td>
                <span className={parameter.required ? "schema-required" : "schema-optional"}>
                  {parameter.required ? "mandatory" : "optional"}
                </span>
              </td>
              <td>{parameter.description ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RequestBodySection({ endpoint }: EndpointContentProps) {
  if (!endpoint.requestBody?.content.length) {
    return null;
  }

  return (
    <section className="docs-section docs-section-spacious" id="request-body">
      <h2>Request body</h2>
      {endpoint.requestBody.description ? <p className="section-copy">{endpoint.requestBody.description}</p> : null}
      <div className="content-stack">
        {endpoint.requestBody.content.map((content) => (
          <div className="schema-card" key={content.contentType}>
            <div className="schema-card-header">
              <h3>{contentLabel(content)}</h3>
              {endpoint.requestBody?.required ? <span className="schema-required">mandatory</span> : null}
            </div>
            <SchemaTable schema={content.schema} rootLabel="body" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ResponseSchema({ response }: { response: ResponseDoc }) {
  if (!response.content.length) {
    return <p className="empty-state">This response has no documented body.</p>;
  }

  return (
    <div className="content-stack">
      {response.content.map((content) => (
        <div className="schema-panel" key={`${response.status}-${content.contentType}`}>
          <p className="content-type-label">{contentLabel(content)}</p>
          <SchemaTable schema={content.schema} rootLabel={`response ${response.status}`} />
        </div>
      ))}
    </div>
  );
}

function ResponseCard({ response }: { response: ResponseDoc }) {
  const tone = getResponseStatusTone(response);

  return (
    <details className="response-doc-card" open={response.status.startsWith("2")}>
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

export function EndpointContent({ endpoint }: EndpointContentProps) {
  const parameterGroups = groupedParameters(endpoint.parameters);

  return (
    <article className="endpoint-content">
      <header className="endpoint-hero">
        <div className="endpoint-kicker">
          <MethodBadge method={endpoint.method} />
          <code>{endpoint.path}</code>
        </div>
        <h1>{endpoint.summary}</h1>
        {endpoint.description ? <p>{endpoint.description}</p> : null}
      </header>

      <section className="overview-card" aria-label="Endpoint overview">
        <div className="overview-card-accent" aria-hidden="true" />
        <div className="overview-grid">
          <div className="overview-item">
            <span>Group</span>
            <strong>{endpoint.tag}</strong>
          </div>
          <div className="overview-item">
            <span>Method</span>
            <strong>{endpoint.method.toUpperCase()}</strong>
          </div>
          <div className="overview-item overview-item-wide">
            <span>Path</span>
            <code>{endpoint.path}</code>
          </div>
          {endpoint.operationId ? (
            <div className="overview-item overview-item-wide">
              <span>Operation ID</span>
              <code>{endpoint.operationId}</code>
            </div>
          ) : null}
        </div>
      </section>

      {parameterGroups.map((group) => (
        <section className="docs-section docs-section-spacious" id={`${group.location}-parameters`} key={group.location}>
          <h2>{group.title}</h2>
          <ParametersTable parameters={group.parameters} />
        </section>
      ))}

      <RequestBodySection endpoint={endpoint} />

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
    </article>
  );
}
