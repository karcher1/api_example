import { redirect } from "next/navigation";
import { getFirstContentPageHref } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default function DocsIndexPage() {
  redirect(getFirstContentPageHref());
}
