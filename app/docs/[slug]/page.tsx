import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleShell } from "@/components/ArticleShell";
import {
  getContentNavigation,
  getContentNavigationTitle,
  getContentPage,
  getContentPageStaticParams,
} from "@/lib/pages";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getContentPageStaticParams();
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getContentPage(slug);

  if (!page) {
    return {
      title: "Article not found",
    };
  }

  return {
    title: `${page.title} | API Docs`,
    description: page.description,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const page = getContentPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <ArticleShell
      page={page}
      navigation={getContentNavigation()}
      navigationTitle={getContentNavigationTitle()}
    />
  );
}
