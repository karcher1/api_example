import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleShell } from "@/components/ArticleShell";
import {
  getSdkNavigation,
  getSdkNavigationTitle,
  getSdkPage,
} from "@/lib/pages";

interface SdkPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SdkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSdkPage(slug);

  if (!page) {
    return {
      title: "SDK page not found",
    };
  }

  return {
    title: `${page.title} | API Docs`,
    description: page.description,
  };
}

export default async function SdkPage({ params }: SdkPageProps) {
  const { slug } = await params;
  const page = getSdkPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <ArticleShell
      page={page}
      navigation={getSdkNavigation()}
      navigationTitle={getSdkNavigationTitle()}
      sectionVariant="webhook"
    />
  );
}
