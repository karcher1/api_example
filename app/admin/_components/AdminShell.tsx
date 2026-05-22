import Link from "next/link";
import { CheckCircle2, LogOut, UploadCloud } from "lucide-react";
import { logoutAction, publishDraftsAction, validateDraftsAction } from "@/app/admin/actions";
import type { DraftStatus } from "@/lib/admin/content";

interface AdminShellProps {
  active: "api" | "articles";
  title: string;
  description: string;
  returnTo: string;
  message?: string;
  error?: string;
  children: React.ReactNode;
}

export function StatusBadge({ status }: { status: DraftStatus }) {
  return <span className={`admin-status admin-status-${status}`}>{status}</span>;
}

export function AdminShell({
  active,
  title,
  description,
  returnTo,
  message,
  error,
  children,
}: AdminShellProps) {
  return (
    <main className="admin-shell">
      <section className="admin-hero">
        <div>
          <p className="admin-eyebrow">Documentation Admin</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="admin-hero-actions">
          <form action={validateDraftsAction}>
            <input type="hidden" name="returnTo" value={returnTo} />
            <button type="submit" className="admin-button admin-button-secondary">
              <CheckCircle2 size={16} />
              Validate
            </button>
          </form>
          <form action={publishDraftsAction}>
            <input type="hidden" name="returnTo" value={returnTo} />
            <button type="submit" className="admin-button admin-button-primary">
              <UploadCloud size={16} />
              Publish
            </button>
          </form>
          <form action={logoutAction}>
            <button type="submit" className="admin-icon-button" aria-label="Log out">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </section>

      <nav className="admin-tabs" aria-label="Admin sections">
        <Link className={active === "api" ? "admin-tab admin-tab-active" : "admin-tab"} href="/admin/api">
          API Reference
        </Link>
        <Link className={active === "articles" ? "admin-tab admin-tab-active" : "admin-tab"} href="/admin/articles">
          Articles
        </Link>
      </nav>

      {message ? <div className="admin-alert admin-alert-success">{message}</div> : null}
      {error ? <div className="admin-alert admin-alert-error">{error}</div> : null}

      {children}
    </main>
  );
}
