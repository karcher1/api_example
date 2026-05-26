import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleShell } from "@/components/ArticleShell";
import {
  getGuideNavigation,
  getGuideNavigationTitle,
  getGuidePage,
} from "@/lib/pages";

interface GuidePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getGuidePage(slug);

  if (!page) {
    return {
      title: "Guide not found",
    };
  }

  return {
    title: `${page.title} | API Docs`,
    description: page.description,
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const page = getGuidePage(slug);

  if (!page) {
    notFound();
  }

  return (
    <ArticleShell
      page={page}
      navigation={getGuideNavigation()}
      navigationTitle={getGuideNavigationTitle()}
    />
  );
}
