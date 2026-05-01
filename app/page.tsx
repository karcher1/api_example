import { redirect } from "next/navigation";
import { getFirstEndpointHref } from "@/lib/openapi";

export default function HomePage() {
  redirect(getFirstEndpointHref());
}
