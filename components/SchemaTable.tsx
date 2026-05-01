"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { SchemaNode } from "@/lib/openapi";

interface SchemaTableProps {
  schema?: SchemaNode;
  rootLabel?: string;
}

interface SchemaRowProps {
  node: SchemaNode;
  label: string;
  path: string;
  depth: number;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}

function schemaTypeLabel(node: SchemaNode): string {
  const base = [node.type, node.format].filter(Boolean).join(" / ");

  if (node.items) {
    return `${base}<${node.items.type}>`;
  }

  return base || "unknown";
}

function schemaDescription(node: SchemaNode): string {
  const parts = [node.description];

  if (node.enum?.length) {
    parts.push(`Enum: ${node.enum.join(", ")}`);
  }

  return parts.filter(Boolean).join(" ");
}

function childNodes(node: SchemaNode): Array<{ node: SchemaNode; label: string }> {
  const children: Array<{ node: SchemaNode; label: string }> = [];

  node.properties?.forEach((property) => {
    children.push({
      node: property,
      label: property.name ?? "property",
    });
  });

  if (node.items) {
    children.push({
      node: { ...node.items, name: node.items.name ?? "items" },
      label: "items",
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

function SchemaRow({ node, label, path, depth, expanded, onToggle }: SchemaRowProps) {
  const children = childNodes(node);
  const hasChildren = children.length > 0;
  const isExpanded = expanded.has(path);
  const description = schemaDescription(node);

  return (
    <Fragment>
      <tr className={hasChildren && isExpanded ? "schema-table-row schema-table-row-open" : "schema-table-row"}>
        <td>
          <div className="schema-field" style={{ paddingLeft: `${depth * 16}px` }}>
            {hasChildren ? (
              <button
                type="button"
                className="schema-expand"
                onClick={() => onToggle(path)}
                aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
                aria-expanded={isExpanded}
              >
                <ChevronRight
                  size={14}
                  className={isExpanded ? "schema-expand-icon schema-expand-icon-open" : "schema-expand-icon"}
                />
              </button>
            ) : (
              <span className="schema-expand-spacer" aria-hidden="true" />
            )}
            <code>{label}</code>
          </div>
        </td>
        <td>
          <span className="schema-type-pill">{schemaTypeLabel(node)}</span>
        </td>
        <td>
          <span className={node.required ? "schema-required" : "schema-optional"}>
            {node.required ? "mandatory" : "optional"}
          </span>
          {node.nullable ? <span className="schema-nullable">nullable</span> : null}
        </td>
        <td>{description || "-"}</td>
      </tr>
      {hasChildren && isExpanded
        ? children.map((child, index) => (
            <SchemaRow
              key={`${path}.${child.label}.${index}`}
              node={child.node}
              label={child.label}
              path={`${path}.${child.label}.${index}`}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))
        : null}
    </Fragment>
  );
}

export function SchemaTable({ schema, rootLabel = "body" }: SchemaTableProps) {
  const defaultExpanded = useMemo(() => new Set(["root"]), []);
  const [expanded, setExpanded] = useState(defaultExpanded);

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

  if (!schema) {
    return <p className="empty-state">No schema documented.</p>;
  }

  const rootName = rootLabel || schema.name || "body";

  return (
    <div className="schema-table-wrap">
      <table className="schema-table">
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Type</th>
            <th>Requirement</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <SchemaRow
            node={{ ...schema, name: rootName }}
            label={rootName}
            path="root"
            depth={0}
            expanded={expanded}
            onToggle={toggle}
          />
        </tbody>
      </table>
    </div>
  );
}
