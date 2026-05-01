import type { SchemaNode } from "@/lib/openapi";

interface SchemaTreeProps {
  schema?: SchemaNode;
  compact?: boolean;
}

interface SchemaNodeViewProps {
  node: SchemaNode;
  depth: number;
  compact?: boolean;
}

function schemaTypeLabel(node: SchemaNode): string {
  const type = node.items ? `${node.type}<${node.items.type}>` : node.type;
  return [type, node.format].filter(Boolean).join(" / ");
}

function hasChildren(node: SchemaNode): boolean {
  return Boolean(
    node.properties?.length ||
      node.items ||
      node.variants?.length ||
      node.additionalProperties,
  );
}

function SchemaNodeView({ node, depth, compact = false }: SchemaNodeViewProps) {
  const row = (
    <div className="schema-row">
      {node.name ? <span className="schema-name">{node.name}</span> : null}
      <span className="schema-type">{schemaTypeLabel(node)}</span>
      {node.required ? <span className="schema-required">required</span> : null}
      {node.nullable ? <span className="schema-optional">nullable</span> : null}
    </div>
  );

  if (!hasChildren(node)) {
    return (
      <div className="schema-leaf">
        {row}
        {node.description ? <p className="schema-description">{node.description}</p> : null}
        {node.enum?.length ? <p className="schema-description">Enum: {node.enum.join(", ")}</p> : null}
      </div>
    );
  }

  return (
    <details className="schema-node" open={depth < (compact ? 1 : 2)}>
      <summary>{row}</summary>
      <div className="schema-children">
        {node.description ? <p className="schema-description">{node.description}</p> : null}
        {node.enum?.length ? <p className="schema-description">Enum: {node.enum.join(", ")}</p> : null}
        {node.properties?.map((child) => (
          <SchemaNodeView key={`${child.name}-${child.type}`} node={child} depth={depth + 1} compact={compact} />
        ))}
        {node.items ? (
          <SchemaNodeView node={{ ...node.items, name: "items" }} depth={depth + 1} compact={compact} />
        ) : null}
        {node.variants?.map((variant, index) => (
          <SchemaNodeView key={`${variant.name}-${index}`} node={variant} depth={depth + 1} compact={compact} />
        ))}
        {node.additionalProperties ? (
          <SchemaNodeView node={node.additionalProperties} depth={depth + 1} compact={compact} />
        ) : null}
      </div>
    </details>
  );
}

export function SchemaTree({ schema, compact = false }: SchemaTreeProps) {
  if (!schema) {
    return <p className="empty-state">No schema documented.</p>;
  }

  return (
    <div className={compact ? "schema-tree schema-tree-compact" : "schema-tree"}>
      <SchemaNodeView node={schema} depth={0} compact={compact} />
    </div>
  );
}
