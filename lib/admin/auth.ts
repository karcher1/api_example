import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "api-docs-admin-session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function configuredPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

function signingSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || configuredPassword() || "api-docs-local-admin-secret";
}

function digest(value: string): Buffer {
  return crypto.createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string): boolean {
  return crypto.timingSafeEqual(digest(left), digest(right));
}

function sign(value: string): string {
  return crypto.createHmac("sha256", signingSecret()).update(value).digest("hex");
}

function sessionCookieValue(): string {
  const payload = `admin:${Date.now()}`;

  return `${payload}.${sign(payload)}`;
}

function verifySessionCookie(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const separatorIndex = value.lastIndexOf(".");

  if (separatorIndex === -1) {
    return false;
  }

  const payload = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);

  return safeEqual(signature, sign(payload));
}

export function isAdminConfigured(): boolean {
  return Boolean(configuredPassword());
}

export function verifyAdminPassword(password: string): boolean {
  const expectedPassword = configuredPassword();

  if (!expectedPassword) {
    return false;
  }

  return safeEqual(password, expectedPassword);
}

export async function hasAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();

  return verifySessionCookie(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function requireAdminSession() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }
}

export async function createAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, sessionCookieValue(), {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
