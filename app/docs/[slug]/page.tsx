import { redirect } from "next/navigation";

interface LegacyGuidePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function LegacyGuidePage({ params }: LegacyGuidePageProps) {
  const { slug } = await params;

  redirect(`/guides/${slug}`);
}
