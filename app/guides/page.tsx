import { redirect } from "next/navigation";
import { getFirstGuidePageHref } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default function GuidesIndexPage() {
  redirect(getFirstGuidePageHref());
}
