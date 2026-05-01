import { Copy, Terminal } from "lucide-react";
import type { EndpointDoc } from "@/lib/openapi";
import { buildCurlExample, getPrimaryResponseExample } from "@/lib/examples";
import { CodeBlock } from "@/components/CodeBlock";
import { MethodBadge } from "@/components/MethodBadge";

interface RightPanelProps {
  endpoint: EndpointDoc;
}

export function RightPanel({ endpoint }: RightPanelProps) {
  const response = getPrimaryResponseExample(endpoint);

  return (
    <div className="right-panel examples-panel">
      <section className="example-card">
        <div className="example-card-header">
          <div>
            <span>Request</span>
            <h3>cURL Request</h3>
          </div>
          <div className="example-card-actions">
            <span className="example-chip">
              <Terminal size={13} aria-hidden="true" />
              Shell
            </span>
            <button type="button" className="example-icon-button" aria-label="Copy request example">
              <Copy size={14} />
            </button>
          </div>
        </div>
        <CodeBlock value={buildCurlExample(endpoint)} language="curl" />
      </section>

      <section className="example-card">
        <div className="example-card-header">
          <div>
            <span>Response</span>
            <h3>JSON Response</h3>
          </div>
          <div className="example-card-actions">
            {response ? (
              <span className="response-code-chip">
                <MethodBadge method={endpoint.method} compact />
                {response.status}
              </span>
            ) : null}
            <button type="button" className="example-icon-button" aria-label="Copy response example">
              <Copy size={14} />
            </button>
          </div>
        </div>
        {response?.description ? <p className="example-copy">{response.description}</p> : null}
        {response?.contentType ? <p className="content-type-label">{response.contentType}</p> : null}
        {response?.example !== undefined ? (
          <CodeBlock value={response.example} language="json" />
        ) : (
          <p className="empty-state">No response example documented.</p>
        )}
      </section>
    </div>
  );
}
