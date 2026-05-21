import { redirect } from "next/navigation";
import { getFirstEndpointHref } from "@/lib/openapi";

export default function ApiIndexPage() {
  redirect(getFirstEndpointHref());
}
