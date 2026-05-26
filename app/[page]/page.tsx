import { notFound, redirect } from "next/navigation";
import { getGuidePage } from "@/lib/pages";

interface StaticPageProps {
  params: Promise<{
    page: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function StaticPage({ params }: StaticPageProps) {
  const { page: pageSlug } = await params;
  const page = getGuidePage(pageSlug);

  if (!page) {
    notFound();
  }

  redirect(page.href);
}
