import { redirect } from "next/navigation";
import { getFirstEndpointHref } from "@/lib/openapi";

export const dynamic = "force-dynamic";

export default function ApiIndexPage() {
  redirect(getFirstEndpointHref());
}
