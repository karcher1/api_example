import Link from "next/link";
import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  createArticleAction,
  deleteArticleAction,
  restoreArticleAction,
  saveArticleAction,
  saveArticleNavigationAction,
} from "@/app/admin/actions";
import { AdminShell, StatusBadge } from "@/app/admin/_components/AdminShell";
import { AdminTextAreaField, AdminTextField, SectionSelect } from "@/app/admin/_components/AdminFields";
import { requireAdminSession } from "@/lib/admin/auth";
import { formatYamlValue, getAdminArticlesState } from "@/lib/admin/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface AdminArticlesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

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

function CreateArticlePanel({ sections }: { sections: ReturnType<typeof getAdminArticlesState>["sections"] }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <h2>Create article</h2>
      </div>
      <form className="admin-form" action={createArticleAction}>
        <AdminTextField label="Title" name="title" required placeholder="Authentication" />
        <AdminTextField label="Slug" name="slug" required placeholder="authentication" />
        <AdminTextAreaField label="Description" name="description" rows={3} />
        <AdminTextAreaField
          label="Content"
          name="content"
          required
          rows={7}
          monospace
          defaultValue={"# New article\n\nStart writing here."}
        />
        <input type="hidden" name="blocks" value="[]" />
        {sections.length ? <SectionSelect sections={sections} /> : null}
        <button type="submit" className="admin-button admin-button-primary" disabled={!sections.length}>
          <Plus size={16} />
          Create draft
        </button>
      </form>
    </section>
  );
}

function ArticleEditor({
  article,
  selectedSlug,
}: {
  article: Record<string, unknown>;
  selectedSlug: string;
}) {
  return (
    <section className="admin-panel admin-editor-panel">
      <div className="admin-panel-heading">
        <h2>Edit article</h2>
        <code>{selectedSlug}</code>
      </div>
      <form className="admin-form" action={saveArticleAction}>
        <input type="hidden" name="originalSlug" value={selectedSlug} />
        <div className="admin-form-grid">
          <AdminTextField label="Title" name="title" required defaultValue={fieldValue(article, "title")} />
          <AdminTextField label="Slug" name="slug" required defaultValue={fieldValue(article, "slug", selectedSlug)} />
        </div>
        <AdminTextAreaField label="Description" name="description" rows={3} defaultValue={fieldValue(article, "description")} />
        <AdminTextAreaField label="Content" name="content" required rows={22} monospace defaultValue={fieldValue(article, "content")} />
        <AdminTextAreaField label="Blocks" name="blocks" rows={12} monospace defaultValue={arrayValue(article, "blocks")} />
        <button type="submit" className="admin-button admin-button-primary">
          <Save size={16} />
          Save draft
        </button>
      </form>
      <form className="admin-danger-row" action={deleteArticleAction}>
        <input type="hidden" name="slug" value={selectedSlug} />
        <button type="submit" className="admin-button admin-button-danger">
          <Trash2 size={16} />
          Delete draft
        </button>
      </form>
    </section>
  );
}

function DeletedArticlePanel({
  slug,
  sections,
}: {
  slug: string;
  sections: ReturnType<typeof getAdminArticlesState>["sections"];
}) {
  return (
    <section className="admin-panel admin-empty-panel">
      <h2>Article marked for deletion</h2>
      <p>This draft removes `{slug}` from the published Articles section after the next publish.</p>
      <form className="admin-form" action={restoreArticleAction}>
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

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  await requireAdminSession();

  const params = (await searchParams) ?? {};
  const state = getAdminArticlesState(paramValue(params, "slug"));

  return (
    <AdminShell
      active="articles"
      title="Articles"
      description="Create, edit, delete, reorder, validate, and publish informational article drafts."
      returnTo="/admin/articles"
      message={paramValue(params, "message")}
      error={paramValue(params, "error")}
    >
      <div className="admin-workspace">
        <aside className="admin-sidebar">
          <CreateArticlePanel sections={state.sections} />

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Article drafts</h2>
            </div>
            <div className="admin-item-list">
              {state.articles.map((article) => (
                <Link
                  href={`/admin/articles?slug=${article.slug}`}
                  className={article.slug === state.selectedSlug ? "admin-item admin-item-active" : "admin-item"}
                  key={article.slug}
                >
                  <span>
                    <strong>{article.title}</strong>
                    <small>{article.slug}</small>
                  </span>
                  <StatusBadge status={article.status} />
                </Link>
              ))}
            </div>
          </section>
        </aside>

        <div className="admin-main-stack">
          {state.selectedArticle && state.selectedSlug ? (
            <ArticleEditor article={state.selectedArticle} selectedSlug={state.selectedSlug} />
          ) : state.selectedSlug ? (
            <DeletedArticlePanel slug={state.selectedSlug} sections={state.sections} />
          ) : (
            <section className="admin-panel admin-empty-panel">
              <h2>No articles found</h2>
            </section>
          )}

          <section className="admin-panel admin-editor-panel">
            <div className="admin-panel-heading">
              <h2>Article navigation YAML</h2>
              <StatusBadge status={state.navigationStatus} />
            </div>
            <form className="admin-form" action={saveArticleNavigationAction}>
              <AdminTextAreaField
                label="Navigation"
                name="navigationYaml"
                rows={16}
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
