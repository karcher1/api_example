import { ArticleContent } from "@/components/ArticleContent";
import { EndpointNav, EndpointNavDrawer } from "@/components/EndpointNav";
import type { NavNode } from "@/lib/openapi";
import type { ContentPage } from "@/lib/pages";

interface ArticleShellProps {
  page: ContentPage;
  navigation: NavNode[];
  navigationTitle?: string;
  displayVariant?: "article" | "reference";
}

export function ArticleShell({
  page,
  navigation,
  navigationTitle = "Articles",
  displayVariant = "article",
}: ArticleShellProps) {
  const isReference = displayVariant === "reference";

  return (
    <>
      <EndpointNavDrawer
        nodes={navigation}
        activeHref={page.href}
        title={navigationTitle}
        ariaLabel="Article navigation"
        storageKey={`article-nav:${navigationTitle}`}
      />
      <div className={isReference ? "articles-grid articles-grid-reference" : "articles-grid"}>
        <aside className="left-rail" aria-label="Article navigation">
          <EndpointNav
            nodes={navigation}
            activeHref={page.href}
            title={navigationTitle}
            ariaLabel="Article navigation"
            storageKey={`article-nav:${navigationTitle}`}
          />
        </aside>
        <main className={isReference ? "main-column article-main-column article-main-column-reference" : "main-column article-main-column"}>
          <ArticleContent page={page} collectionTitle={navigationTitle} displayVariant={displayVariant} />
        </main>
      </div>
    </>
  );
}
