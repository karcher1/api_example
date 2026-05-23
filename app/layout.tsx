import type { Metadata } from "next";
import "@/app/globals.css";
import { Header, type HeaderNavItem } from "@/components/Header";
import { getFirstEndpointHref } from "@/lib/openapi";
import { getFirstContentPageHref, getFirstSdkPageHref, getFirstWebhookPageHref } from "@/lib/pages";

export const metadata: Metadata = {
  title: "API Docs",
  description: "Static API documentation generated from YAML content files.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const navItems: HeaderNavItem[] = [
    {
      label: "API Reference",
      href: getFirstEndpointHref(),
      match: "/api",
    },
    {
      label: "Articles",
      href: getFirstContentPageHref(),
      match: "/docs",
    },
    {
      label: "Webhooks",
      href: getFirstWebhookPageHref(),
      match: "/webhooks",
    },
    {
      label: "SDK",
      href: getFirstSdkPageHref(),
      match: "/sdk",
    },
  ];

  return (
    <html lang="en">
      <body>
        <Header items={navItems} />
        {children}
      </body>
    </html>
  );
}
