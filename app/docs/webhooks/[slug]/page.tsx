import { redirect } from "next/navigation";

interface LegacyWebhookPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function LegacyWebhookPage({ params }: LegacyWebhookPageProps) {
  const { slug } = await params;

  redirect(`/webhooks/${slug}`);
}
