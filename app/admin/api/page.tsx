import Link from "next/link";
import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  createEndpointAction,
  deleteEndpointAction,
  restoreEndpointAction,
  saveApiNavigationAction,
  saveEndpointAction,
} from "@/app/admin/actions";
import { AdminShell, StatusBadge } from "@/app/admin/_components/AdminShell";
import { AdminTextAreaField, AdminTextField, SectionSelect } from "@/app/admin/_components/AdminFields";
import { requireAdminSession } from "@/lib/admin/auth";
import { formatYamlValue, getAdminApiState } from "@/lib/admin/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface AdminApiPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

function paramValue(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const value = params[key];

  return Array.isArray(value) ? value[0] : value;
}

function fieldValue(document: Record<string, unknown> | undefined, field: string, fallback = ""): string {
  const value = document?.[field];

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function arrayValue(document: Record<string, unknown> | undefined, field: string): string {
  return formatYamlValue(Array.isArray(document?.[field]) ? document[field] : []);
}

function MethodSelect({ value }: { value: string }) {
  const normalized = value.toUpperCase();

  return (
    <label className="admin-field">
      <span>Method</span>
      <select name="method" defaultValue={METHODS.includes(normalized) ? normalized : "GET"} required>
        {METHODS.map((method) => (
          <option value={method} key={method}>
            {method}
          </option>
        ))}
      </select>
    </label>
  );
}

function CreateEndpointPanel({ sections }: { sections: ReturnType<typeof getAdminApiState>["sections"] }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <h2>Create endpoint</h2>
      </div>
      <form className="admin-form" action={createEndpointAction}>
        <AdminTextField label="Title" name="title" required placeholder="Create buyer" />
        <AdminTextField label="Slug" name="slug" required placeholder="create-buyer" />
        <div className="admin-form-grid admin-form-grid-compact">
          <MethodSelect value="GET" />
          <AdminTextField label="Status" name="status" required defaultValue="draft" />
        </div>
        <AdminTextField label="Path" name="path" required placeholder="/api/v1/resource" />
        <AdminTextAreaField label="Description" name="description" required rows={3} />
        <input type="hidden" name="headerParameters" value="[]" />
        <input type="hidden" name="pathParameters" value="[]" />
        <input type="hidden" name="queryParameters" value="[]" />
        <input type="hidden" name="requestBodyParameters" value="[]" />
        <input type="hidden" name="responses" value="[]" />
        <input type="hidden" name="blocks" value="[]" />
        <input type="hidden" name="requestExamples" value="[]" />
        <input type="hidden" name="responseExamples" value="[]" />
        {sections.length ? <SectionSelect sections={sections} /> : null}
        <button type="submit" className="admin-button admin-button-primary" disabled={!sections.length}>
          <Plus size={16} />
          Create draft
        </button>
      </form>
    </section>
  );
}

function EndpointEditor({
  endpoint,
  selectedSlug,
}: {
  endpoint: Record<string, unknown>;
  selectedSlug: string;
}) {
  return (
    <section className="admin-panel admin-editor-panel">
      <div className="admin-panel-heading">
        <h2>Edit endpoint</h2>
        <code>{selectedSlug}</code>
      </div>
      <form className="admin-form" action={saveEndpointAction}>
        <input type="hidden" name="originalSlug" value={selectedSlug} />
        <div className="admin-form-grid">
          <AdminTextField label="Title" name="title" required defaultValue={fieldValue(endpoint, "title")} />
          <AdminTextField label="Slug" name="slug" required defaultValue={fieldValue(endpoint, "slug", selectedSlug)} />
        </div>
        <div className="admin-form-grid admin-form-grid-compact">
          <MethodSelect value={fieldValue(endpoint, "method", "GET")} />
          <AdminTextField label="Status" name="status" required defaultValue={fieldValue(endpoint, "status", "draft")} />
        </div>
        <AdminTextField label="Path" name="path" required defaultValue={fieldValue(endpoint, "path")} />
        <AdminTextAreaField label="Description" name="description" required rows={4} defaultValue={fieldValue(endpoint, "description")} />

        <div className="admin-fieldset">
          <h3>Parameters</h3>
          <AdminTextAreaField label="Header parameters" name="headerParameters" rows={9} monospace defaultValue={arrayValue(endpoint, "headerParameters")} />
          <AdminTextAreaField label="Path parameters" name="pathParameters" rows={7} monospace defaultValue={arrayValue(endpoint, "pathParameters")} />
          <AdminTextAreaField label="Query parameters" name="queryParameters" rows={7} monospace defaultValue={arrayValue(endpoint, "queryParameters")} />
          <AdminTextAreaField label="Request body parameters" name="requestBodyParameters" rows={10} monospace defaultValue={arrayValue(endpoint, "requestBodyParameters")} />
        </div>

        <div className="admin-fieldset">
          <h3>Responses and content blocks</h3>
          <AdminTextAreaField label="Responses" name="responses" rows={12} monospace defaultValue={arrayValue(endpoint, "responses")} />
          <AdminTextAreaField label="Blocks" name="blocks" rows={8} monospace defaultValue={arrayValue(endpoint, "blocks")} />
        </div>

        <div className="admin-fieldset">
          <h3>Examples</h3>
          <AdminTextAreaField label="Request examples" name="requestExamples" rows={12} monospace defaultValue={arrayValue(endpoint, "requestExamples")} />
          <AdminTextAreaField label="Response examples" name="responseExamples" rows={12} monospace defaultValue={arrayValue(endpoint, "responseExamples")} />
        </div>

        <button type="submit" className="admin-button admin-button-primary">
          <Save size={16} />
          Save draft
        </button>
      </form>
      <form className="admin-danger-row" action={deleteEndpointAction}>
        <input type="hidden" name="slug" value={selectedSlug} />
        <button type="submit" className="admin-button admin-button-danger">
          <Trash2 size={16} />
          Delete draft
        </button>
      </form>
    </section>
  );
}

function DeletedEndpointPanel({
  slug,
  sections,
}: {
  slug: string;
  sections: ReturnType<typeof getAdminApiState>["sections"];
}) {
  return (
    <section className="admin-panel admin-empty-panel">
      <h2>Endpoint marked for deletion</h2>
      <p>This draft removes `{slug}` from the published API Reference after the next publish.</p>
      <form className="admin-form" action={restoreEndpointAction}>
        <input type="hidden" name="slug" value={slug} />
        {sections.length ? <SectionSelect sections={sections} label="Restore into section" /> : null}
        <button type="submit" className="admin-button admin-button-secondary" disabled={!sections.length}>
          <RotateCcw size={16} />
          Restore draft
        </button>
      </form>
    </section>
  );
}

export default async function AdminApiPage({ searchParams }: AdminApiPageProps) {
  await requireAdminSession();

  const params = (await searchParams) ?? {};
  const state = getAdminApiState(paramValue(params, "slug"));

  return (
    <AdminShell
      active="api"
      title="API Reference"
      description="Create, edit, delete, reorder, validate, and publish endpoint documentation drafts."
      returnTo="/admin/api"
      message={paramValue(params, "message")}
      error={paramValue(params, "error")}
    >
      <div className="admin-workspace">
        <aside className="admin-sidebar">
          <CreateEndpointPanel sections={state.sections} />

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Endpoint drafts</h2>
            </div>
            <div className="admin-item-list">
              {state.endpoints.map((endpoint) => (
                <Link
                  href={`/admin/api?slug=${endpoint.slug}`}
                  className={endpoint.slug === state.selectedSlug ? "admin-item admin-item-active" : "admin-item"}
                  key={endpoint.slug}
                >
                  <span>
                    <strong>{endpoint.title}</strong>
                    <small>{endpoint.slug}</small>
                  </span>
                  <StatusBadge status={endpoint.status} />
                </Link>
              ))}
            </div>
          </section>
        </aside>

        <div className="admin-main-stack">
          {state.selectedEndpoint && state.selectedSlug ? (
            <EndpointEditor endpoint={state.selectedEndpoint} selectedSlug={state.selectedSlug} />
          ) : state.selectedSlug ? (
            <DeletedEndpointPanel slug={state.selectedSlug} sections={state.sections} />
          ) : (
            <section className="admin-panel admin-empty-panel">
              <h2>No endpoints found</h2>
            </section>
          )}

          <section className="admin-panel admin-editor-panel">
            <div className="admin-panel-heading">
              <h2>API navigation YAML</h2>
              <StatusBadge status={state.navigationStatus} />
            </div>
            <form className="admin-form" action={saveApiNavigationAction}>
              <AdminTextAreaField
                label="Navigation"
                name="navigationYaml"
                rows={22}
                monospace
                required
                defaultValue={state.navigationYaml}
              />
              <button type="submit" className="admin-button admin-button-primary">
                <Save size={16} />
                Save navigation
              </button>
            </form>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
