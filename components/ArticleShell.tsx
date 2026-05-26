import { ArticleContent } from "@/components/ArticleContent";
import { EndpointNav, EndpointNavDrawer } from "@/components/EndpointNav";
import type { NavNode } from "@/lib/openapi";
import type { ContentPage } from "@/lib/pages";

interface ArticleShellProps {
  page: ContentPage;
  navigation: NavNode[];
  navigationTitle?: string;
  sectionVariant?: "article" | "webhook";
}

export function ArticleShell({
  page,
  navigation,
  navigationTitle = "Guides",
  sectionVariant = "article",
}: ArticleShellProps) {
  const navigationAriaLabel = `${navigationTitle} navigation`;
  const navigationStorageKey = `content-nav:${navigationTitle}`;

  return (
    <>
      <EndpointNavDrawer
        nodes={navigation}
        activeHref={page.href}
        title={navigationTitle}
        ariaLabel={navigationAriaLabel}
        storageKey={navigationStorageKey}
      />
      <div className={`articles-grid articles-grid-${sectionVariant}`}>
        <aside className="left-rail" aria-label={navigationAriaLabel}>
          <EndpointNav
            nodes={navigation}
            activeHref={page.href}
            title={navigationTitle}
            ariaLabel={navigationAriaLabel}
            storageKey={navigationStorageKey}
          />
        </aside>
        <main className={`main-column article-main-column article-main-column-${sectionVariant}`}>
          <ArticleContent page={page} collectionTitle={navigationTitle} sectionVariant={sectionVariant} />
        </main>
      </div>
    </>
  );
}
