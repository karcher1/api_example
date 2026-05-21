import { redirect } from "next/navigation";
import { getFirstContentPageHref } from "@/lib/pages";

export default function DocsIndexPage() {
  redirect(getFirstContentPageHref());
}
