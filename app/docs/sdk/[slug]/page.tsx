import { redirect } from "next/navigation";

interface LegacySdkPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function LegacySdkPage({ params }: LegacySdkPageProps) {
  const { slug } = await params;

  redirect(`/sdk/${slug}`);
}
