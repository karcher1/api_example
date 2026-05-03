import type { EndpointDoc, NavNode } from "@/lib/openapi";
import { EndpointContent } from "@/components/EndpointContent";
import { EndpointNav, EndpointNavDrawer } from "@/components/EndpointNav";
import { RightPanel } from "@/components/RightPanel";

interface ApiShellProps {
  endpoint: EndpointDoc;
  navigation: NavNode[];
  navigationTitle?: string;
}

export function ApiShell({ endpoint, navigation, navigationTitle }: ApiShellProps) {
  return (
    <>
      <EndpointNavDrawer nodes={navigation} activeHref={endpoint.href} title={navigationTitle} />
      <div className="docs-grid">
        <aside className="left-rail" aria-label="Endpoint navigation">
          <EndpointNav nodes={navigation} activeHref={endpoint.href} title={navigationTitle} />
        </aside>
        <main className="main-column">
          <EndpointContent endpoint={endpoint} />
          <div className="mobile-right-panel" aria-label="Request and response panel">
            <RightPanel endpoint={endpoint} />
          </div>
        </main>
        <aside className="right-rail" aria-label="Request and response panel">
          <RightPanel endpoint={endpoint} />
        </aside>
      </div>
    </>
  );
}
