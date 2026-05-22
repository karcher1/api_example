import { ArticleContent } from "@/components/ArticleContent";
import { EndpointNav, EndpointNavDrawer } from "@/components/EndpointNav";
import type { NavNode } from "@/lib/openapi";
import type { ContentPage } from "@/lib/pages";

interface ArticleShellProps {
  page: ContentPage;
  navigation: NavNode[];
  navigationTitle?: string;
}

export function ArticleShell({ page, navigation, navigationTitle = "Articles" }: ArticleShellProps) {
  return (
    <>
      <EndpointNavDrawer
        nodes={navigation}
        activeHref={page.href}
        title={navigationTitle}
        ariaLabel="Article navigation"
        storageKey={`article-nav:${navigationTitle}`}
      />
      <div className="articles-grid">
        <aside className="left-rail" aria-label="Article navigation">
          <EndpointNav
            nodes={navigation}
            activeHref={page.href}
            title={navigationTitle}
            ariaLabel="Article navigation"
            storageKey={`article-nav:${navigationTitle}`}
          />
        </aside>
        <main className="main-column article-main-column">
          <ArticleContent page={page} />
        </main>
      </div>
    </>
  );
}
