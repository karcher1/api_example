import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/auth";
import { ensureDraftContent } from "@/lib/admin/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminIndexPage() {
  await requireAdminSession();
  ensureDraftContent();
  redirect("/admin/api");
}
