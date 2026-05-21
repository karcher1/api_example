import { redirect } from "next/navigation";
import { getFirstEndpointHref } from "@/lib/openapi";

interface EndpointPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function EndpointPage({ params }: EndpointPageProps) {
  const { slug } = await params;
  const endpointSlug = slug[slug.length - 1];

  redirect(endpointSlug ? `/api/${endpointSlug}` : getFirstEndpointHref());
}
