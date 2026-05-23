import Link from "next/link";

export type InlineNode = string | JSX.Element;

export function renderInline(text: string, keyPrefix: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  const pattern = /(!\[([^\]]*)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("![")) {
      const alt = match[2] ?? "";
      const src = match[3] ?? "";

      nodes.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img className="mdx-image" src={src} alt={alt} key={`${keyPrefix}-image-${index}`} />,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code className="mdx-code" key={`${keyPrefix}-code-${index}`}>
          {match[4] ?? token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-strong-${index}`}>
          {match[5] ?? token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("*")) {
      nodes.push(
        <em key={`${keyPrefix}-em-${index}`}>
          {match[6] ?? token.slice(1, -1)}
        </em>,
      );
    } else {
      const label = match[7] ?? "";
      const href = match[8] ?? "";

      nodes.push(
        href.startsWith("/") ? (
          <Link className="mdx-link" href={href} key={`${keyPrefix}-link-${index}`}>
            {label}
          </Link>
        ) : (
          <a className="mdx-link" href={href} key={`${keyPrefix}-link-${index}`}>
            {label}
          </a>
        ),
      );
    }

    lastIndex = pattern.lastIndex;
    index += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function MarkdownInline({ source, keyPrefix }: { source: string; keyPrefix: string }) {
  return <>{renderInline(source, keyPrefix)}</>;
}
