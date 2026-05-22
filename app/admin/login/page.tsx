import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { hasAdminSession, isAdminConfigured } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface AdminLoginPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function paramValue(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const value = params[key];

  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  if (await hasAdminSession()) {
    redirect("/admin");
  }

  const params = (await searchParams) ?? {};
  const error = paramValue(params, "error");
  const configured = isAdminConfigured();

  return (
    <main className="admin-login-shell">
      <section className="admin-login-card">
        <div className="admin-login-icon">
          <LockKeyhole size={22} />
        </div>
        <div>
          <p className="admin-eyebrow">Documentation Admin</p>
          <h1>Sign in</h1>
          <p>Use the password from `ADMIN_PASSWORD` to edit draft documentation content.</p>
        </div>

        {!configured ? (
          <div className="admin-alert admin-alert-error">
            `ADMIN_PASSWORD` is not configured. Set it before using the admin interface.
          </div>
        ) : null}
        {error ? <div className="admin-alert admin-alert-error">{error}</div> : null}

        <form className="admin-login-form" action={loginAction}>
          <label className="admin-field">
            <span>Password</span>
            <input type="password" name="password" autoComplete="current-password" required disabled={!configured} />
          </label>
          <button type="submit" className="admin-button admin-button-primary" disabled={!configured}>
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
