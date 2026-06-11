import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ApiArticleShell } from "@/components/ApiArticleShell";
import { ApiShell } from "@/components/ApiShell";
import {
  getApiPageBySlug,
  getEndpointBySlug,
  getEndpointNavigation,
  getEndpointNavigationTitle,
} from "@/lib/openapi";

interface EndpointPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: EndpointPageProps): Promise<Metadata> {
  const { slug } = await params;
  const endpoint = getEndpointBySlug([slug]);

  if (endpoint) {
    return {
      title: `${endpoint.title} | API Docs`,
      description: endpoint.description,
    };
  }

  const page = getApiPageBySlug(slug);

  if (!page) {
    return {
      title: "API page not found",
    };
  }

  return {
    title: `${page.title} | API Docs`,
    description: page.description,
  };
}

export default async function EndpointPage({ params }: EndpointPageProps) {
  const { slug } = await params;
  const endpoint = getEndpointBySlug([slug]);

  if (!endpoint) {
    const page = getApiPageBySlug(slug);

    if (!page) {
      notFound();
    }

    return (
      <ApiArticleShell
        page={page}
        navigation={getEndpointNavigation()}
        navigationTitle={getEndpointNavigationTitle()}
      />
    );
  }

  return (
    <ApiShell
      endpoint={endpoint}
      navigation={getEndpointNavigation()}
      navigationTitle={getEndpointNavigationTitle()}
    />
  );
}
