import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleShell } from "@/components/ArticleShell";
import {
  getWebhookNavigation,
  getWebhookNavigationTitle,
  getWebhookPage,
} from "@/lib/pages";

interface WebhookPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: WebhookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getWebhookPage(slug);

  if (!page) {
    return {
      title: "Webhook page not found",
    };
  }

  return {
    title: `${page.title} | API Docs`,
    description: page.description,
  };
}

export default async function WebhookPage({ params }: WebhookPageProps) {
  const { slug } = await params;
  const page = getWebhookPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <ArticleShell
      page={page}
      navigation={getWebhookNavigation()}
      navigationTitle={getWebhookNavigationTitle()}
      displayVariant="reference"
    />
  );
}
