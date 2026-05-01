import type { Metadata } from "next";
import "@/app/globals.css";
import { Header, type HeaderNavItem } from "@/components/Header";
import { getFirstEndpointHref } from "@/lib/openapi";
import { getContentPages } from "@/lib/pages";

export const metadata: Metadata = {
  title: "API Docs",
  description: "Static API documentation generated from OpenAPI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const navItems: HeaderNavItem[] = [
    {
      label: "API Reference",
      href: getFirstEndpointHref(),
      match: "/reference",
    },
    ...getContentPages().map((page) => ({
      label: page.title,
      href: `/${page.slug}`,
      match: `/${page.slug}`,
    })),
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
