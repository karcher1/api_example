import { CodeBlock } from "@/components/CodeBlock";
import { SafeMarkdown } from "@/components/SafeMarkdown";
import type { ArticleBlock, ContentPage } from "@/lib/pages";

interface ArticleContentProps {
  page: ContentPage;
}

function noticeTone(type: string): string {
  if (type === "warning" || type === "danger" || type === "info") {
    return type;
  }

  if (type === "tip") {
    return "success";
  }

  return "neutral";
}

function ArticleBlockView({ block }: { block: ArticleBlock }) {
  if (["note", "info", "warning", "danger", "tip"].includes(block.type)) {
    return (
      <aside className={`docs-notice docs-notice-${noticeTone(block.type)}`} id={block.id}>
        {block.title ? <h3>{block.title}</h3> : null}
        {block.content ? <SafeMarkdown source={block.content} /> : null}
      </aside>
    );
  }

  if (block.type === "code") {
    return (
      <section className="docs-block docs-block-code" id={block.id}>
        {block.title ? <h2>{block.title}</h2> : null}
        {block.content ? <SafeMarkdown source={block.content} /> : null}
        <CodeBlock value={block.code ?? ""} language={block.language ?? "text"} />
      </section>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="article-image-block" id={block.id}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={block.src} alt={block.alt ?? ""} />
        {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <section className="docs-block docs-block-text" id={block.id}>
      {block.title ? <h2>{block.title}</h2> : null}
      {block.content ? <SafeMarkdown source={block.content} /> : null}
    </section>
  );
}

function bodyWithoutDuplicateTitle(page: ContentPage): string {
  const normalizedTitle = page.title.trim().toLowerCase();
  const lines = page.body.replace(/\r\n/g, "\n").split("\n");
  const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);

  if (firstContentIndex === -1) {
    return page.body;
  }

  const firstLine = lines[firstContentIndex].trim();

  if (!firstLine.startsWith("# ")) {
    return page.body;
  }

  const heading = firstLine.slice(2).trim().toLowerCase();

  if (heading !== normalizedTitle) {
    return page.body;
  }

  return [...lines.slice(0, firstContentIndex), ...lines.slice(firstContentIndex + 1)].join("\n").trimStart();
}

export function ArticleContent({ page }: ArticleContentProps) {
  const body = bodyWithoutDuplicateTitle(page);

  return (
    <article className="mdx-document article-document">
      <header className="static-page-header">
        <p className="page-eyebrow">Articles</p>
        <h1>{page.title}</h1>
        {page.description ? <p>{page.description}</p> : null}
      </header>
      <SafeMarkdown source={body} />
      {page.blocks.length ? (
        <div className="article-blocks">
          {page.blocks.map((block) => (
            <ArticleBlockView block={block} key={block.id} />
          ))}
        </div>
      ) : null}
    </article>
  );
}
