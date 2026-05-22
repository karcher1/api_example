import { redirect } from "next/navigation";
import { getFirstEndpointHref } from "@/lib/openapi";

export const dynamic = "force-dynamic";

export default function HomePage() {
  redirect(getFirstEndpointHref());
}
