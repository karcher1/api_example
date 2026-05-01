import type { BodyContent, EndpointDoc, EndpointParameter, ResponseDoc } from "@/lib/openapi";
import { CodeBlock } from "@/components/CodeBlock";
import { MethodBadge } from "@/components/MethodBadge";
import { SchemaTree } from "@/components/SchemaTree";

interface EndpointContentProps {
  endpoint: EndpointDoc;
}

function contentTitle(content: BodyContent): string {
  return content.contentType || "application/json";
}

function ParametersTable({ parameters }: { parameters: EndpointParameter[] }) {
  if (!parameters.length) {
    return <p className="empty-state">No parameters documented.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="docs-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((parameter) => (
            <tr key={`${parameter.location}-${parameter.name}`}>
              <td>
                <code>{parameter.name}</code>
              </td>
              <td>{parameter.location}</td>
              <td>{parameter.schema?.type ?? "unknown"}</td>
              <td>{parameter.required ? "Yes" : "No"}</td>
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
    return <p className="empty-state">No request body documented.</p>;
  }

  return (
    <div className="content-stack">
      {endpoint.requestBody.description ? <p>{endpoint.requestBody.description}</p> : null}
      {endpoint.requestBody.content.map((content) => (
        <div className="schema-card" key={content.contentType}>
          <div className="schema-card-header">
            <h3>{contentTitle(content)}</h3>
            {endpoint.requestBody?.required ? <span className="schema-required">required</span> : null}
          </div>
          <SchemaTree schema={content.schema} />
          {content.example !== undefined ? <CodeBlock value={content.example} /> : null}
        </div>
      ))}
    </div>
  );
}

function ResponseSection({ response }: { response: ResponseDoc }) {
  return (
    <div className="schema-card">
      <div className="schema-card-header">
        <h3>
          <span className="status-pill">{response.status}</span>
          {response.description ? <span>{response.description}</span> : null}
        </h3>
      </div>
      {response.content.length ? (
        <div className="content-stack">
          {response.content.map((content) => (
            <div key={content.contentType}>
              <p className="content-type-label">{contentTitle(content)}</p>
              <SchemaTree schema={content.schema} />
              {content.example !== undefined ? <CodeBlock value={content.example} /> : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">This response has no documented body.</p>
      )}
    </div>
  );
}

export function EndpointContent({ endpoint }: EndpointContentProps) {
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

      <section className="docs-section" id="parameters">
        <h2>Parameters</h2>
        <ParametersTable parameters={endpoint.parameters} />
      </section>

      <section className="docs-section" id="request-body">
        <h2>Request body</h2>
        <RequestBodySection endpoint={endpoint} />
      </section>

      <section className="docs-section" id="responses">
        <h2>Responses</h2>
        <div className="content-stack">
          {endpoint.responses.length ? (
            endpoint.responses.map((response) => <ResponseSection key={response.status} response={response} />)
          ) : (
            <p className="empty-state">No responses documented.</p>
          )}
        </div>
      </section>
    </article>
  );
}
