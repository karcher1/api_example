import Link from "next/link";
import { getFirstEndpointHref } from "@/lib/openapi";

export default function NotFound() {
  return (
    <main className="static-page">
      <article className="mdx-document">
        <p className="page-eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or is not included in the documentation build.</p>
        <Link className="primary-link" href={getFirstEndpointHref()}>
          Open API Reference
        </Link>
      </article>
    </main>
  );
}
