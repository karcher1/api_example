import type { CSSProperties } from "react";
import { renderInline } from "@/components/MarkdownInline";
import { SchemaTable } from "@/components/SchemaTable";
import { createHeadingIdTracker } from "@/lib/markdown";
import type { SchemaNode } from "@/lib/openapi";

interface SafeMarkdownProps {
  source: string;
  sectionCards?: boolean;
  plainSections?: boolean;
}

type TableKind = "events" | "params" | "default";

function isTableStart(lines: string[], index: number): boolean {
  return Boolean(
    lines[index]?.trim().startsWith("|") &&
      lines[index + 1]?.trim().startsWith("|") &&
      lines[index + 1]?.includes("---"),
  );
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim();
  const withoutLeadingPipe = trimmed.startsWith("|") ? trimmed.slice(1) : trimmed;
  const content = withoutLeadingPipe.endsWith("|") && !withoutLeadingPipe.endsWith("\\|")
    ? withoutLeadingPipe.slice(0, -1)
    : withoutLeadingPipe;
  const cells: string[] = [];
  let current = "";

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === "\\" && nextCharacter === "|") {
      current += "|";
      index += 1;
      continue;
    }

    if (character === "|") {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());

  return cells;
}

function parseTable(lines: string[], start: number) {
  const tableLines: string[] = [];
  let index = start;

  while (index < lines.length && lines[index].trim().startsWith("|")) {
    tableLines.push(lines[index].trim());
    index += 1;
  }

  const rows = tableLines.map((line) =>
    splitTableRow(line),
  );
  const header = rows[0] ?? [];

  return {
    header,
    body: rows.slice(2),
    kind: tableKind(header),
    nextIndex: index,
  };
}

function tableKind(header: string[]): TableKind {
  const normalized = header.map((cell) => cell.trim().toLowerCase());
  const headerKey = normalized.join("|");

  if (headerKey === "reason|event|action|outcome") {
    return "events";
  }

  if (
    headerKey === "attribute|type|requirement|description" ||
    headerKey === "attribute|type|requirement|description|standard"
  ) {
    return "params";
  }

  return "default";
}

function stripInlineCode(value: string): string {
  const trimmed = value.trim();
  const codeMatch = trimmed.match(/^`([^`]+)`$/);

  return codeMatch ? codeMatch[1].trim() : trimmed;
}

function isRequiredRequirement(value: string): boolean {
  const normalized = value.trim().toLowerCase();

  return normalized === "mandatory" || normalized === "required";
}

function tableRowsToSchema(rows: string[][]): SchemaNode {
  const root: SchemaNode = {
    type: "object",
    properties: [],
  };
  const nodesByPath = new Map<string, SchemaNode>();

  rows.forEach((row) => {
    const attribute = stripInlineCode(row[0] ?? "");
    const pathParts = attribute.split(".").map((part) => part.trim()).filter(Boolean);

    if (!pathParts.length) {
      return;
    }

    let parent = root;
    let currentPath = "";

    pathParts.forEach((part, partIndex) => {
      const isLast = partIndex === pathParts.length - 1;
      currentPath = currentPath ? `${currentPath}.${part}` : part;

      let node = nodesByPath.get(currentPath);

      if (!node) {
        node = {
          name: part,
          type: isLast ? stripInlineCode(row[1] ?? "") || "unknown" : "object",
        };
        parent.properties = parent.properties ?? [];
        parent.properties.push(node);
        nodesByPath.set(currentPath, node);
      }

      if (isLast) {
        node.type = stripInlineCode(row[1] ?? "") || "unknown";
        node.required = isRequiredRequirement(row[2] ?? "");
        node.description = row[3]?.trim() || undefined;
      }

      parent = node;
    });
  });

  return root;
}

function eventTableCellClass(cellIndex: number): string | undefined {
  if (cellIndex === 1) {
    return "webhook-event-cell";
  }

  if (cellIndex === 2) {
    return "webhook-action-cell";
  }

  return undefined;
}

function renderTableCellContent(
  kind: TableKind,
  cell: string,
  rowIndex: number,
  cellIndex: number,
) {
  if (kind === "events" && cellIndex === 1) {
    return (
      <span className="webhook-event-token">
        {stripInlineCode(cell).split("_").map((part, index, parts) => (
          <span className="webhook-event-token-part" key={`${part}-${index}`}>
            {part}
            {index < parts.length - 1 ? "_" : ""}
          </span>
        ))}
      </span>
    );
  }

  if (kind === "events" && cellIndex === 2) {
    return <span className="webhook-action-label">{stripInlineCode(cell)}</span>;
  }

  return renderInline(cell, `table-${rowIndex}-${cellIndex}`);
}

function blockClassName(block: JSX.Element): string {
  const className = (block.props as { className?: unknown }).className;

  return typeof className === "string" ? className : "";
}

function isSectionHeading(block: JSX.Element): boolean {
  return blockClassName(block).split(/\s+/).includes("mdx-h2");
}

function renderSectionCards(blocks: JSX.Element[]) {
  const sections: Array<{
    key: string;
    type: "intro" | "section";
    blocks: JSX.Element[];
  }> = [];

  blocks.forEach((block, index) => {
    if (isSectionHeading(block)) {
      sections.push({
        key: `markdown-section-${index}`,
        type: "section",
        blocks: [block],
      });
      return;
    }

    const current = sections[sections.length - 1];

    if (current) {
      current.blocks.push(block);
      return;
    }

    sections.push({
      key: "markdown-intro",
      type: "intro",
      blocks: [block],
    });
  });

  return (
    <>
      {sections.map((section, index) => (
        <section
          className={[
            "article-section-card",
            section.type === "intro" ? "article-section-card-intro" : "",
          ].filter(Boolean).join(" ")}
          key={section.key}
          style={{ "--article-card-index": index } as CSSProperties}
        >
          {section.blocks}
        </section>
      ))}
    </>
  );
}

function groupBlocksBySection(blocks: JSX.Element[]) {
  const sections: Array<{
    key: string;
    type: "intro" | "section";
    blocks: JSX.Element[];
  }> = [];

  blocks.forEach((block, index) => {
    if (isSectionHeading(block)) {
      sections.push({
        key: `markdown-section-${index}`,
        type: "section",
        blocks: [block],
      });
      return;
    }

    const current = sections[sections.length - 1];

    if (current) {
      current.blocks.push(block);
      return;
    }

    sections.push({
      key: "markdown-intro",
      type: "intro",
      blocks: [block],
    });
  });

  return sections;
}

function renderPlainSections(blocks: JSX.Element[]) {
  return (
    <>
      {groupBlocksBySection(blocks).map((section) => (
        <section
          className={[
            "article-section-plain",
            section.type === "intro" ? "article-section-plain-intro" : "",
          ].filter(Boolean).join(" ")}
          key={section.key}
        >
          {section.blocks}
        </section>
      ))}
    </>
  );
}

export function SafeMarkdown({ source, sectionCards = false, plainSections = false }: SafeMarkdownProps) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: JSX.Element[] = [];
  const nextHeadingId = createHeadingIdTracker();
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
      const tableKindClass = table.kind === "default" ? "" : ` table-wrap-${table.kind}`;
      const docsTableKindClass = table.kind === "default" ? "" : ` docs-table-${table.kind}`;

      if (table.kind === "params") {
        blocks.push(
          <div className="webhook-schema-tree" key={`block-${blockIndex}`}>
            <SchemaTable
              schema={tableRowsToSchema(table.body)}
              rootLabel="payload"
              variant="fieldList"
              initialExpansion="default"
            />
          </div>,
        );
      } else {
        blocks.push(
          <div className={`table-wrap${tableKindClass}`} key={`block-${blockIndex}`}>
            <table className={`docs-table${docsTableKindClass}`}>
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
                    {row.map((cell, cellIndex) => {
                      const cellClass = table.kind === "events" ? eventTableCellClass(cellIndex) : undefined;

                      return (
                        <td className={cellClass} key={`${rowIndex}-${cellIndex}`}>
                          {renderTableCellContent(table.kind, cell, rowIndex, cellIndex)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      index = table.nextIndex;
      blockIndex += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      const headingText = trimmed.slice(4);
      const headingId = nextHeadingId(headingText);

      blocks.push(
        <h3 className="mdx-h3" id={headingId} key={`block-${blockIndex}`}>
          {renderInline(headingText, `h3-${blockIndex}`)}
        </h3>,
      );
      index += 1;
      blockIndex += 1;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      const headingText = trimmed.slice(3);
      const headingId = nextHeadingId(headingText);

      blocks.push(
        <h2 className="mdx-h2" id={headingId} key={`block-${blockIndex}`}>
          {renderInline(headingText, `h2-${blockIndex}`)}
        </h2>,
      );
      index += 1;
      blockIndex += 1;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      const headingText = trimmed.slice(2);
      const headingId = nextHeadingId(headingText);

      blocks.push(
        <h1 className="mdx-h1" id={headingId} key={`block-${blockIndex}`}>
          {renderInline(headingText, `h1-${blockIndex}`)}
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

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];

      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push(
        <blockquote className="mdx-blockquote" key={`block-${blockIndex}`}>
          {renderInline(quoteLines.join(" "), `quote-${blockIndex}`)}
        </blockquote>,
      );
      blockIndex += 1;
      continue;
    }

    const paragraphLines: string[] = [];

    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("#") &&
      !lines[index].trim().startsWith(">") &&
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

  if (sectionCards) {
    return renderSectionCards(blocks);
  }

  if (plainSections) {
    return renderPlainSections(blocks);
  }

  return <>{blocks}</>;
}
