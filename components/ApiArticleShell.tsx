import { ArticleContent } from "@/components/ArticleContent";
import { EndpointNav, EndpointNavDrawer } from "@/components/EndpointNav";
import { SingleExamplePanel } from "@/components/TabbedExamples";
import type { ApiArticlePage, NavNode } from "@/lib/openapi";

interface ApiArticleShellProps {
  page: ApiArticlePage;
  navigation: NavNode[];
  navigationTitle?: string;
}

export function ApiArticleShell({ page, navigation, navigationTitle }: ApiArticleShellProps) {
  const hasExamples = page.examples.length > 0;
  const examplesPanel = () => (
    <SingleExamplePanel
      title="Response"
      examples={page.examples}
      ariaLabel="Select response example"
      emptyState="No response example documented."
    />
  );

  return (
    <>
      <EndpointNavDrawer nodes={navigation} activeHref={page.href} title={navigationTitle} />
      <div className="docs-grid api-article-grid">
        <aside className="left-rail" aria-label="API navigation">
          <EndpointNav nodes={navigation} activeHref={page.href} title={navigationTitle} />
        </aside>
        <main className="main-column article-main-column article-main-column-api-reference">
          <ArticleContent
            page={page}
            collectionTitle={navigationTitle}
            sectionVariant="api-reference"
            sectionCards={false}
            plainSections
          />
          {hasExamples ? (
            <div className="mobile-right-panel" aria-label="Response examples panel">
              {examplesPanel()}
            </div>
          ) : null}
        </main>
        <aside className="right-rail" aria-label="Response examples panel">
          {hasExamples ? examplesPanel() : null}
        </aside>
      </div>
    </>
  );
}
