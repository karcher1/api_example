"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ChevronRight } from "lucide-react";
import type { SchemaNode } from "@/lib/openapi";

interface SchemaTableProps {
  schema?: SchemaNode;
  rootLabel?: string;
}

interface SchemaTreeNodeProps {
  node: SchemaNode;
  label: string;
  path: string;
  depth: number;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}

interface SchemaChild {
  node: SchemaNode;
  label: string;
}

function schemaTypeLabel(node: SchemaNode): string {
  if (node.items) {
    const itemLabel = [node.items.type, node.items.format].filter(Boolean).join(" / ");
    return `array of ${itemLabel || "items"}`;
  }

  return node.type || "unknown";
}

function schemaDescription(node: SchemaNode): string {
  return node.description || "No description provided.";
}

function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

function schemaChips(node: SchemaNode): string[] {
  const chips: string[] = [];

  if (node.format && !node.items) {
    chips.push(node.format);
  }

  if (node.nullable) {
    chips.push("nullable");
  }

  if (node.enum?.length) {
    chips.push(`enum: ${node.enum.join(", ")}`);
  }

  if (node.default !== undefined) {
    chips.push(`default: ${formatValue(node.default)}`);
  }

  if (node.minimum !== undefined) {
    chips.push(`min: ${node.minimum}`);
  }

  if (node.maximum !== undefined) {
    chips.push(`max: ${node.maximum}`);
  }

  if (node.minLength !== undefined) {
    chips.push(`min length: ${node.minLength}`);
  }

  if (node.maxLength !== undefined) {
    chips.push(`max length: ${node.maxLength}`);
  }

  if (node.pattern) {
    chips.push(`pattern: ${node.pattern}`);
  }

  if (node.minItems !== undefined) {
    chips.push(`min items: ${node.minItems}`);
  }

  if (node.maxItems !== undefined) {
    chips.push(`max items: ${node.maxItems}`);
  }

  return chips;
}

function childNodes(node: SchemaNode): SchemaChild[] {
  const children: SchemaChild[] = [];

  node.properties?.forEach((property) => {
    children.push({
      node: property,
      label: property.name ?? "property",
    });
  });

  if (node.items) {
    children.push({
      node: { ...node.items, name: node.items.name ?? "items" },
      label: "items[]",
    });
  }

  node.variants?.forEach((variant, index) => {
    children.push({
      node: variant,
      label: variant.name ?? `Option ${index + 1}`,
    });
  });

  if (node.additionalProperties) {
    children.push({
      node: {
        ...node.additionalProperties,
        name: node.additionalProperties.name ?? "additionalProperty",
      },
      label: "additionalProperty",
    });
  }

  return children;
}

function childPath(parentPath: string, child: SchemaChild, index: number): string {
  return `${parentPath}.${child.label}.${index}`;
}

function collectExpandedPaths(node: SchemaNode, path = "root", depth = 0, includeAll = false): Set<string> {
  const children = childNodes(node);
  const paths = new Set<string>();

  if (children.length > 0 && (includeAll || depth <= 1)) {
    paths.add(path);
  }

  children.forEach((child, index) => {
    collectExpandedPaths(child.node, childPath(path, child, index), depth + 1, includeAll).forEach((item) => {
      paths.add(item);
    });
  });

  return paths;
}

function depthStyle(depth: number): CSSProperties {
  return {
    "--schema-indent": `${42 + depth * 30}px`,
    "--schema-guide-offset": `${21 + depth * 30}px`,
    "--schema-dot-offset": `${14 + depth * 30}px`,
    "--schema-indent-mobile": `${36 + depth * 20}px`,
    "--schema-guide-offset-mobile": `${18 + depth * 20}px`,
    "--schema-dot-offset-mobile": `${11 + depth * 20}px`,
  } as CSSProperties;
}

function SchemaTreeNode({
  node,
  label,
  path,
  depth,
  expanded,
  onToggle,
}: SchemaTreeNodeProps) {
  const children = childNodes(node);
  const hasChildren = children.length > 0;
  const isExpanded = expanded.has(path);
  const chips = schemaChips(node);

  return (
    <div
      className={[
        "schema-tree-node",
        `schema-tree-node-depth-${depth % 5}`,
        hasChildren && isExpanded ? "schema-tree-node-open" : "",
      ].join(" ")}
      style={depthStyle(depth)}
    >
      <div className="schema-tree-item">
        <span className="schema-tree-dot" aria-hidden="true" />
        <div className="schema-tree-body">
          <div className="schema-tree-main">
            {hasChildren ? (
              <button
                type="button"
                className="schema-tree-toggle"
                onClick={() => onToggle(path)}
                aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
                aria-expanded={isExpanded}
              >
                <ChevronRight
                  size={14}
                  className={isExpanded ? "schema-tree-toggle-icon schema-tree-toggle-icon-open" : "schema-tree-toggle-icon"}
                />
              </button>
            ) : (
              <span className="schema-tree-toggle-spacer" aria-hidden="true" />
            )}
            <span className="schema-tree-name">{label}</span>
            <span className="schema-tree-type-text">{schemaTypeLabel(node)}</span>
            {chips.map((chip) => (
              <span className="schema-tree-chip" key={`${path}-${chip}`}>
                {chip}
              </span>
            ))}
          </div>
          <p className="schema-tree-description">{schemaDescription(node)}</p>
        </div>
        <span className={node.required ? "schema-required" : "schema-optional"}>
          {node.required ? "mandatory" : "optional"}
        </span>
      </div>

      {hasChildren && isExpanded ? (
        <div className="schema-tree-children">
          {children.map((child, index) => (
            <SchemaTreeNode
              key={childPath(path, child, index)}
              node={child.node}
              label={child.label}
              path={childPath(path, child, index)}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SchemaTable({ schema, rootLabel = "body" }: SchemaTableProps) {
  const rootName = rootLabel || schema?.name || "body";
  const rootNode = useMemo(() => (schema ? { ...schema, name: rootName } : undefined), [schema, rootName]);
  const defaultExpanded = useMemo(() => (rootNode ? collectExpandedPaths(rootNode) : new Set<string>()), [rootNode]);
  const allExpanded = useMemo(() => (rootNode ? collectExpandedPaths(rootNode, "root", 0, true) : new Set<string>()), [rootNode]);
  const [expanded, setExpanded] = useState(() => defaultExpanded);

  function toggle(path: string) {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });
  }

  if (!rootNode) {
    return <p className="empty-state">No schema documented.</p>;
  }

  return (
    <div className="schema-tree-wrap">
      <div className="schema-tree-toolbar">
        <span>Schema fields</span>
        <div className="schema-tree-controls" aria-label="Schema tree controls">
          <button type="button" className="schema-tree-control" onClick={() => setExpanded(allExpanded)}>
            Expand all
          </button>
          <button type="button" className="schema-tree-control" onClick={() => setExpanded(new Set<string>())}>
            Collapse all
          </button>
        </div>
      </div>
      <div className="schema-tree-list">
        <SchemaTreeNode
          node={rootNode}
          label={rootName}
          path="root"
          depth={0}
          expanded={expanded}
          onToggle={toggle}
        />
      </div>
    </div>
  );
}
