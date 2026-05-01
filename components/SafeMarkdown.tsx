import Link from "next/link";

interface SafeMarkdownProps {
  source: string;
}

type InlineNode = string | JSX.Element;

function renderInline(text: string, keyPrefix: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  const pattern = /(`[^`]+`|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("`")) {
      nodes.push(
        <code className="mdx-code" key={`${keyPrefix}-code-${index}`}>
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const label = match[2] ?? "";
      const href = match[3] ?? "";

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

function isTableStart(lines: string[], index: number): boolean {
  return Boolean(
    lines[index]?.trim().startsWith("|") &&
      lines[index + 1]?.trim().startsWith("|") &&
      lines[index + 1]?.includes("---"),
  );
}

function parseTable(lines: string[], start: number) {
  const tableLines: string[] = [];
  let index = start;

  while (index < lines.length && lines[index].trim().startsWith("|")) {
    tableLines.push(lines[index].trim());
    index += 1;
  }

  const rows = tableLines.map((line) =>
    line
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((cell) => cell.trim()),
  );

  return {
    header: rows[0] ?? [],
    body: rows.slice(2),
    nextIndex: index,
  };
}

export function SafeMarkdown({ source }: SafeMarkdownProps) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: JSX.Element[] = [];
  let index = 0;
  let blockIndex = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim() || "text";
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      index += 1;
      blocks.push(
        <pre className="mdx-pre" key={`block-${blockIndex}`}>
          <code data-language={language}>{codeLines.join("\n")}</code>
        </pre>,
      );
      blockIndex += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      const table = parseTable(lines, index);

      blocks.push(
        <div className="table-wrap" key={`block-${blockIndex}`}>
          <table className="docs-table">
            <thead>
              <tr>
                {table.header.map((cell) => (
                  <th key={cell}>{renderInline(cell, `table-head-${cell}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.body.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`}>{renderInline(cell, `table-${rowIndex}-${cellIndex}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      index = table.nextIndex;
      blockIndex += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 className="mdx-h3" key={`block-${blockIndex}`}>
          {renderInline(trimmed.slice(4), `h3-${blockIndex}`)}
        </h3>,
      );
      index += 1;
      blockIndex += 1;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2 className="mdx-h2" key={`block-${blockIndex}`}>
          {renderInline(trimmed.slice(3), `h2-${blockIndex}`)}
        </h2>,
      );
      index += 1;
      blockIndex += 1;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h1 className="mdx-h1" key={`block-${blockIndex}`}>
          {renderInline(trimmed.slice(2), `h1-${blockIndex}`)}
        </h1>,
      );
      index += 1;
      blockIndex += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items: string[] = [];

      while (
        index < lines.length &&
        (ordered ? /^\d+\.\s+/.test(lines[index].trim()) : /^[-*]\s+/.test(lines[index].trim()))
      ) {
        items.push(lines[index].trim().replace(ordered ? /^\d+\.\s+/ : /^[-*]\s+/, ""));
        index += 1;
      }

      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag
          className={ordered ? "mdx-list mdx-list-ordered" : "mdx-list"}
          key={`block-${blockIndex}`}
        >
          {items.map((item, itemIndex) => (
            <li className="mdx-li" key={`${item}-${itemIndex}`}>
              {renderInline(item, `li-${blockIndex}-${itemIndex}`)}
            </li>
          ))}
        </ListTag>,
      );
      blockIndex += 1;
      continue;
    }

    const paragraphLines: string[] = [];

    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("#") &&
      !lines[index].trim().startsWith("```") &&
      !isTableStart(lines, index) &&
      !/^[-*]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push(
      <p className="mdx-p" key={`block-${blockIndex}`}>
        {renderInline(paragraphLines.join(" "), `p-${blockIndex}`)}
      </p>,
    );
    blockIndex += 1;
  }

  return <>{blocks}</>;
}
