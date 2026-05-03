import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ApiShell } from "@/components/ApiShell";
import {
  getEndpointBySlug,
  getEndpointNavigation,
  getEndpointNavigationTitle,
  getEndpointStaticParams,
} from "@/lib/openapi";

interface EndpointPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getEndpointStaticParams();
}

export async function generateMetadata({ params }: EndpointPageProps): Promise<Metadata> {
  const { slug } = await params;
  const endpoint = getEndpointBySlug(slug);

  if (!endpoint) {
    return {
      title: "Endpoint not found",
    };
  }

  return {
    title: `${endpoint.summary} | API Docs`,
    description: endpoint.description,
  };
}

export default async function EndpointPage({ params }: EndpointPageProps) {
  const { slug } = await params;
  const endpoint = getEndpointBySlug(slug);

  if (!endpoint) {
    notFound();
  }

  return (
    <ApiShell
      endpoint={endpoint}
      navigation={getEndpointNavigation()}
      navigationTitle={getEndpointNavigationTitle()}
    />
  );
}
