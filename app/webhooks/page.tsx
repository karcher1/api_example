import { redirect } from "next/navigation";
import { getFirstWebhookPageHref } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default function WebhooksIndexPage() {
  redirect(getFirstWebhookPageHref());
}
