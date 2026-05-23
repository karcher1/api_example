import { redirect } from "next/navigation";
import { getFirstSdkPageHref } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default function LegacySdkIndexPage() {
  redirect(getFirstSdkPageHref());
}
