import { CodeBlock } from "@/components/CodeBlock";
import { SafeMarkdown } from "@/components/SafeMarkdown";
import { bodyWithoutDuplicateTitle } from "@/lib/content-rendering";
import type { ArticleBlock, ContentPage } from "@/lib/pages";

interface ArticleContentProps {
  page: ContentPage;
  collectionTitle?: string;
  sectionVariant?: "article" | "webhook";
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

export function ArticleContent({
  page,
  sectionVariant = "article",
}: ArticleContentProps) {
  const body = bodyWithoutDuplicateTitle(page);

  return (
    <article
      className={[
        "mdx-document",
        "article-document",
        `article-document-${sectionVariant}`,
      ].join(" ")}
    >
      <header className={`static-page-header article-hero article-hero-${sectionVariant}`}>
        <h1>{page.title}</h1>
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
