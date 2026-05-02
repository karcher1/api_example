"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ChevronRight } from "lucide-react";
import type { SchemaNode } from "@/lib/openapi";

interface SchemaTableProps {
  schema?: SchemaNode;
  rootLabel?: string;
  variant?: "tree" | "fieldList";
  chrome?: "panel" | "embedded";
  initialExpansion?: "all" | "default" | "none";
  controlMode?: "toolbar" | "inline-toggle" | "none";
}

interface SchemaTreeNodeProps {
  node: SchemaNode;
  label: string;
  path: string;
  depth: number;
  isRoot?: boolean;
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

function initialExpandedPaths(node: SchemaNode, initialExpansion: NonNullable<SchemaTableProps["initialExpansion"]>) {
  if (initialExpansion === "all") {
    return collectExpandedPaths(node, "root", 0, true);
  }

  if (initialExpansion === "none") {
    return new Set<string>();
  }

  return collectExpandedPaths(node);
}

function branchStyle(depth: number): CSSProperties {
  const desktopStep = 30;
  const mobileStep = 20;

  return {
    "--schema-indent": `${42 + depth * desktopStep}px`,
    "--schema-dot-center": `${22 + depth * desktopStep}px`,
    "--schema-parent-dot-center": `${22 + Math.max(depth - 1, 0) * desktopStep}px`,
    "--schema-marker-center-y": "27px",
    "--schema-indent-mobile": `${36 + depth * mobileStep}px`,
    "--schema-dot-center-mobile": `${18 + depth * mobileStep}px`,
    "--schema-parent-dot-center-mobile": `${18 + Math.max(depth - 1, 0) * mobileStep}px`,
  } as CSSProperties;
}

function SchemaTreeNode({
  node,
  label,
  path,
  depth,
  isRoot = false,
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
        isRoot ? "schema-tree-node-root" : "",
        hasChildren ? "schema-tree-node-expandable" : "schema-tree-node-leaf",
        hasChildren && isExpanded ? "schema-tree-node-open" : "",
      ].join(" ")}
      style={branchStyle(depth)}
    >
      <div className="schema-tree-item">
        {hasChildren ? (
          <button
            type="button"
            className="schema-tree-node-point"
            onClick={() => onToggle(path)}
            aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
            aria-expanded={isExpanded}
          >
            <ChevronRight className="schema-tree-node-chevron" size={14} strokeWidth={2.4} aria-hidden="true" />
          </button>
        ) : (
          <span className="schema-tree-node-point schema-tree-node-point-leaf" aria-hidden="true">
            <span className="schema-tree-leaf-dot" />
          </span>
        )}
        <div className="schema-tree-body">
          <div className="schema-tree-main">
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
          {node.required ? "required" : "optional"}
        </span>
      </div>

      {hasChildren && isExpanded ? (
        <div className="schema-tree-children">
          {children.map((child, index) => {
            const nextPath = childPath(path, child, index);

            return (
              <SchemaTreeNode
                key={nextPath}
                node={child.node}
                label={child.label}
                path={nextPath}
                depth={depth + 1}
                expanded={expanded}
                onToggle={onToggle}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function SchemaTable({
  schema,
  rootLabel = "body",
  variant = "tree",
  chrome = "panel",
  initialExpansion = "default",
  controlMode = "toolbar",
}: SchemaTableProps) {
  const rootName = rootLabel || schema?.name || "body";
  const rootNode = useMemo(() => (schema ? { ...schema, name: rootName } : undefined), [schema, rootName]);
  const defaultExpanded = useMemo(
    () => (rootNode ? initialExpandedPaths(rootNode, initialExpansion) : new Set<string>()),
    [initialExpansion, rootNode],
  );
  const allExpanded = useMemo(() => (rootNode ? collectExpandedPaths(rootNode, "root", 0, true) : new Set<string>()), [rootNode]);
  const [expanded, setExpanded] = useState(() => defaultExpanded);
  const rootChildren = useMemo(() => (rootNode ? childNodes(rootNode) : []), [rootNode]);
  const isFieldList = variant === "fieldList";
  const isEmbedded = chrome === "embedded";
  const canBulkToggle = allExpanded.size > 0;
  const allPathsExpanded = canBulkToggle && Array.from(allExpanded).every((path) => expanded.has(path));

  function toggleAll() {
    setExpanded(allPathsExpanded ? new Set<string>() : allExpanded);
  }

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
    <div
      className={[
        "schema-tree-wrap",
        isFieldList ? "schema-tree-wrap-field-list" : "",
        isEmbedded ? "schema-tree-wrap-embedded" : "",
      ].filter(Boolean).join(" ")}
    >
      {controlMode === "toolbar" && !isEmbedded ? (
        <div className={isFieldList ? "schema-tree-toolbar schema-tree-toolbar-actions-only" : "schema-tree-toolbar"}>
          {isFieldList ? null : <span>Schema fields</span>}
          <div className="schema-tree-controls" aria-label="Schema tree controls">
            <button type="button" className="schema-tree-control" onClick={() => setExpanded(allExpanded)}>
              Expand all
            </button>
            <button type="button" className="schema-tree-control" onClick={() => setExpanded(new Set<string>())}>
              Collapse all
            </button>
          </div>
        </div>
      ) : null}
      {controlMode === "inline-toggle" && canBulkToggle ? (
        <div className="schema-tree-inline-actions">
          <button type="button" className="schema-tree-inline-control" onClick={toggleAll}>
            {allPathsExpanded ? "Свернуть всё" : "Развернуть всё"}
          </button>
        </div>
      ) : null}
      <div className="schema-tree-list">
        {isFieldList ? (
          rootChildren.length > 0 ? (
            rootChildren.map((child, index) => {
              const path = childPath("root", child, index);

              return (
                <SchemaTreeNode
                  key={path}
                  node={child.node}
                  label={child.label}
                  path={path}
                  depth={0}
                  isRoot
                  expanded={expanded}
                  onToggle={toggle}
                />
              );
            })
          ) : (
            <p className="empty-state schema-tree-empty">No fields documented.</p>
          )
        ) : (
          <SchemaTreeNode
            node={rootNode}
            label={rootName}
            path="root"
            depth={0}
            isRoot
            expanded={expanded}
            onToggle={toggle}
          />
        )}
      </div>
    </div>
  );
}
