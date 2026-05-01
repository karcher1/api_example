import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SafeMarkdown } from "@/components/SafeMarkdown";
import { getContentPage, getContentPageStaticParams } from "@/lib/pages";

interface StaticPageProps {
  params: Promise<{
    page: string;
  }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getContentPageStaticParams();
}

export async function generateMetadata({ params }: StaticPageProps): Promise<Metadata> {
  const { page: pageSlug } = await params;
  const page = getContentPage(pageSlug);

  if (!page) {
    return {
      title: "Page not found",
    };
  }

  return {
    title: `${page.title} | API Docs`,
    description: page.description,
  };
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { page: pageSlug } = await params;
  const page = getContentPage(pageSlug);

  if (!page) {
    notFound();
  }

  return (
    <main className="static-page">
      <article className="mdx-document">
        <header className="static-page-header">
          <p className="page-eyebrow">Documentation</p>
          <h1>{page.title}</h1>
          {page.description ? <p>{page.description}</p> : null}
        </header>
        <SafeMarkdown source={page.body} />
      </article>
    </main>
  );
}
