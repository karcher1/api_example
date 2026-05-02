"use client";

import { useMemo, useState, type CSSProperties } from "react";
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
  branchIndex: number;
  branchDepth: number;
  isRoot?: boolean;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}

interface SchemaChild {
  node: SchemaNode;
  label: string;
}

type RgbTuple = readonly [number, number, number];

const BRANCH_COLORS: RgbTuple[] = [
  [22, 125, 132],
  [48, 101, 145],
  [139, 105, 224],
  [88, 184, 151],
  [184, 139, 82],
  [190, 18, 60],
];
const ROOT_BRANCH_COLOR: RgbTuple = [91, 105, 116];
const WHITE: RgbTuple = [255, 255, 255];

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

function rgbValue(color: RgbTuple): string {
  return color.join(" ");
}

function mixRgb(source: RgbTuple, target: RgbTuple, amount: number): RgbTuple {
  return source.map((channel, index) =>
    Math.round(channel + (target[index] - channel) * amount),
  ) as unknown as RgbTuple;
}

function branchColor(branchIndex: number): RgbTuple {
  if (branchIndex < 0) {
    return ROOT_BRANCH_COLOR;
  }

  return BRANCH_COLORS[branchIndex % BRANCH_COLORS.length];
}

function branchStyle(depth: number, branchIndex: number, branchDepth: number): CSSProperties {
  const desktopStep = 30;
  const mobileStep = 20;
  const color = branchColor(branchIndex);
  const tintAmount = Math.min(0.58, 0.22 + branchDepth * 0.08);
  const softTintAmount = Math.min(0.78, 0.54 + branchDepth * 0.05);

  return {
    "--schema-indent": `${42 + depth * desktopStep}px`,
    "--schema-dot-offset": `${14 + depth * desktopStep}px`,
    "--schema-dot-center": `${22 + depth * desktopStep}px`,
    "--schema-parent-dot-center": `${22 + Math.max(depth - 1, 0) * desktopStep}px`,
    "--schema-indent-mobile": `${36 + depth * mobileStep}px`,
    "--schema-dot-offset-mobile": `${10 + depth * mobileStep}px`,
    "--schema-dot-center-mobile": `${18 + depth * mobileStep}px`,
    "--schema-parent-dot-center-mobile": `${18 + Math.max(depth - 1, 0) * mobileStep}px`,
    "--schema-branch": rgbValue(color),
    "--schema-branch-tint": rgbValue(mixRgb(color, WHITE, tintAmount)),
    "--schema-branch-soft": rgbValue(mixRgb(color, WHITE, softTintAmount)),
    "--schema-line-opacity": String(Math.max(0.42, 0.78 - branchDepth * 0.06)),
  } as CSSProperties;
}

function SchemaTreeNode({
  node,
  label,
  path,
  depth,
  branchIndex,
  branchDepth,
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
      style={branchStyle(depth, branchIndex, branchDepth)}
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
            <span className="schema-tree-node-point-core" aria-hidden="true" />
          </button>
        ) : (
          <span className="schema-tree-node-point schema-tree-node-point-leaf" aria-hidden="true">
            <span className="schema-tree-node-point-core" />
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
          {node.required ? "mandatory" : "optional"}
        </span>
      </div>

      {hasChildren && isExpanded ? (
        <div className="schema-tree-children">
          {children.map((child, index) => {
            const nextPath = childPath(path, child, index);
            const nextBranchIndex = isRoot ? index : branchIndex;
            const nextBranchDepth = isRoot ? 0 : branchDepth + 1;

            return (
              <SchemaTreeNode
                key={nextPath}
                node={child.node}
                label={child.label}
                path={nextPath}
                depth={depth + 1}
                branchIndex={nextBranchIndex}
                branchDepth={nextBranchDepth}
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
          branchIndex={-1}
          branchDepth={0}
          isRoot
          expanded={expanded}
          onToggle={toggle}
        />
      </div>
    </div>
  );
}
