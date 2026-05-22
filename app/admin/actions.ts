"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parse } from "yaml";
import {
  createArticleDraft,
  createEndpointDraft,
  deleteArticleDraft,
  deleteEndpointDraft,
  publishDraftContent,
  restoreArticleDraft,
  restoreEndpointDraft,
  saveArticleDraft,
  saveEndpointDraft,
  saveNavigationDraft,
  slugFromAdminInput,
  validateDraftContent,
  type ArticleDraftInput,
  type EndpointDraftInput,
} from "@/lib/admin/content";
import {
  clearAdminSession,
  createAdminSession,
  requireAdminSession,
  verifyAdminPassword,
} from "@/lib/admin/auth";

function textField(formData: FormData, field: string): string {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

function requiredTextField(formData: FormData, field: string): string {
  const value = textField(formData, field).trim();

  if (!value) {
    throw new Error(`${field} is required.`);
  }

  return value;
}

function optionalTextField(formData: FormData, field: string): string | undefined {
  const value = textField(formData, field).trim();

  return value || undefined;
}

function parseYamlArrayField(formData: FormData, field: string): unknown[] {
  const source = textField(formData, field).trim();

  if (!source) {
    return [];
  }

  const parsed = parse(source);

  if (!Array.isArray(parsed)) {
    throw new Error(`${field} must be a YAML array.`);
  }

  return parsed;
}

function resultUrl(pathname: string, params: Record<string, string | undefined>): string {
  const url = new URL(pathname, "http://admin.local");

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return `${url.pathname}${url.search}`;
}

function redirectWithMessage(pathname: string, message: string, extra: Record<string, string | undefined> = {}): never {
  redirect(resultUrl(pathname, { ...extra, message }));
}

function redirectWithError(pathname: string, error: unknown, extra: Record<string, string | undefined> = {}): never {
  const message = error instanceof Error ? error.message : String(error);

  redirect(resultUrl(pathname, { ...extra, error: message }));
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/api");
  revalidatePath("/admin/articles");
}

function revalidatePublicDocs() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/api");
  revalidatePath("/docs");
}

function endpointInputFromForm(formData: FormData, originalSlug?: string): EndpointDraftInput {
  const title = requiredTextField(formData, "title");
  const slug = slugFromAdminInput(requiredTextField(formData, "slug"));

  return {
    originalSlug,
    slug,
    title,
    description: requiredTextField(formData, "description"),
    method: requiredTextField(formData, "method"),
    path: requiredTextField(formData, "path"),
    status: requiredTextField(formData, "status"),
    headerParameters: parseYamlArrayField(formData, "headerParameters"),
    pathParameters: parseYamlArrayField(formData, "pathParameters"),
    queryParameters: parseYamlArrayField(formData, "queryParameters"),
    requestBodyParameters: parseYamlArrayField(formData, "requestBodyParameters"),
    responses: parseYamlArrayField(formData, "responses"),
    blocks: parseYamlArrayField(formData, "blocks"),
    requestExamples: parseYamlArrayField(formData, "requestExamples"),
    responseExamples: parseYamlArrayField(formData, "responseExamples"),
  };
}

function articleInputFromForm(formData: FormData, originalSlug?: string): ArticleDraftInput {
  const title = requiredTextField(formData, "title");
  const slug = slugFromAdminInput(requiredTextField(formData, "slug"));

  return {
    originalSlug,
    slug,
    title,
    description: optionalTextField(formData, "description"),
    content: requiredTextField(formData, "content"),
    blocks: parseYamlArrayField(formData, "blocks"),
  };
}

export async function loginAction(formData: FormData) {
  const password = textField(formData, "password");

  if (!verifyAdminPassword(password)) {
    redirectWithError("/admin/login", "Invalid admin password.");
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createEndpointAction(formData: FormData) {
  await requireAdminSession();

  let slug = "";

  try {
    const input = endpointInputFromForm(formData);
    const sectionId = optionalTextField(formData, "sectionId");
    slug = createEndpointDraft(input, sectionId);

    revalidateAdmin();
  } catch (error) {
    redirectWithError("/admin/api", error);
  }

  redirectWithMessage("/admin/api", "Endpoint draft created.", { slug });
}

export async function saveEndpointAction(formData: FormData) {
  await requireAdminSession();

  const originalSlug = requiredTextField(formData, "originalSlug");
  let slug = originalSlug;

  try {
    slug = saveEndpointDraft(endpointInputFromForm(formData, originalSlug));

    revalidateAdmin();
  } catch (error) {
    redirectWithError("/admin/api", error, { slug: originalSlug });
  }

  redirectWithMessage("/admin/api", "Endpoint draft saved.", { slug });
}

export async function deleteEndpointAction(formData: FormData) {
  await requireAdminSession();

  const slug = requiredTextField(formData, "slug");

  try {
    deleteEndpointDraft(slug);

    revalidateAdmin();
  } catch (error) {
    redirectWithError("/admin/api", error, { slug });
  }

  redirectWithMessage("/admin/api", "Endpoint marked for deletion.");
}

export async function restoreEndpointAction(formData: FormData) {
  await requireAdminSession();

  const slug = requiredTextField(formData, "slug");

  try {
    restoreEndpointDraft(slug, optionalTextField(formData, "sectionId"));

    revalidateAdmin();
  } catch (error) {
    redirectWithError("/admin/api", error, { slug });
  }

  redirectWithMessage("/admin/api", "Endpoint restored from published content.", { slug });
}

export async function saveApiNavigationAction(formData: FormData) {
  await requireAdminSession();

  try {
    saveNavigationDraft("api", requiredTextField(formData, "navigationYaml"));

    revalidateAdmin();
  } catch (error) {
    redirectWithError("/admin/api", error);
  }

  redirectWithMessage("/admin/api", "API navigation draft saved.");
}

export async function createArticleAction(formData: FormData) {
  await requireAdminSession();

  let slug = "";

  try {
    const input = articleInputFromForm(formData);
    slug = createArticleDraft(input, optionalTextField(formData, "sectionId"));

    revalidateAdmin();
  } catch (error) {
    redirectWithError("/admin/articles", error);
  }

  redirectWithMessage("/admin/articles", "Article draft created.", { slug });
}

export async function saveArticleAction(formData: FormData) {
  await requireAdminSession();

  const originalSlug = requiredTextField(formData, "originalSlug");
  let slug = originalSlug;

  try {
    slug = saveArticleDraft(articleInputFromForm(formData, originalSlug));

    revalidateAdmin();
  } catch (error) {
    redirectWithError("/admin/articles", error, { slug: originalSlug });
  }

  redirectWithMessage("/admin/articles", "Article draft saved.", { slug });
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdminSession();

  const slug = requiredTextField(formData, "slug");

  try {
    deleteArticleDraft(slug);

    revalidateAdmin();
  } catch (error) {
    redirectWithError("/admin/articles", error, { slug });
  }

  redirectWithMessage("/admin/articles", "Article marked for deletion.");
}

export async function restoreArticleAction(formData: FormData) {
  await requireAdminSession();

  const slug = requiredTextField(formData, "slug");

  try {
    restoreArticleDraft(slug, optionalTextField(formData, "sectionId"));

    revalidateAdmin();
  } catch (error) {
    redirectWithError("/admin/articles", error, { slug });
  }

  redirectWithMessage("/admin/articles", "Article restored from published content.", { slug });
}

export async function saveArticleNavigationAction(formData: FormData) {
  await requireAdminSession();

  try {
    saveNavigationDraft("articles", requiredTextField(formData, "navigationYaml"));

    revalidateAdmin();
  } catch (error) {
    redirectWithError("/admin/articles", error);
  }

  redirectWithMessage("/admin/articles", "Article navigation draft saved.");
}

export async function validateDraftsAction(formData: FormData) {
  await requireAdminSession();

  const returnTo = textField(formData, "returnTo") || "/admin";

  try {
    validateDraftContent();
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirectWithMessage(returnTo, "Draft content validates.");
}

export async function publishDraftsAction(formData: FormData) {
  await requireAdminSession();

  const returnTo = textField(formData, "returnTo") || "/admin";

  try {
    publishDraftContent();
    revalidateAdmin();
    revalidatePublicDocs();
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirectWithMessage(returnTo, "Drafts published.");
}
