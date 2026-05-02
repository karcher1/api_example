import type { EndpointDoc } from "@/lib/openapi";
import { getRequestExamples, getResponseExamples } from "@/lib/examples";
import { TabbedExamples } from "@/components/TabbedExamples";

interface RightPanelProps {
  endpoint: EndpointDoc;
}

export function RightPanel({ endpoint }: RightPanelProps) {
  const requestExamples = getRequestExamples(endpoint);
  const responseExamples = getResponseExamples(endpoint);

  return (
    <TabbedExamples
      requestExamples={requestExamples}
      responseExamples={responseExamples}
    />
  );
}
