import { notFound, redirect } from "next/navigation";
import { getContentPage, getLegacyContentPageStaticParams } from "@/lib/pages";

interface StaticPageProps {
  params: Promise<{
    page: string;
  }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getLegacyContentPageStaticParams();
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { page: pageSlug } = await params;
  const page = getContentPage(pageSlug);

  if (!page) {
    notFound();
  }

  redirect(page.href);
}
