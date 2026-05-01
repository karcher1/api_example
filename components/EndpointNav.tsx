"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, X } from "lucide-react";
import type { NavNode } from "@/lib/openapi";
import { MethodBadge } from "@/components/MethodBadge";

interface EndpointNavProps {
  nodes: NavNode[];
  activeHref: string;
  onNavigate?: () => void;
}

interface NodeProps {
  node: NavNode;
  level: number;
  expanded: Set<string>;
  activeHref: string;
  onToggle: (id: string) => void;
  onNavigate?: () => void;
}

function collectOpenNodeIds(nodes: NavNode[], activeHref: string, open = new Set<string>()): Set<string> {
  nodes.forEach((node) => {
    const childContainsActive = node.children.some((child) => {
      if (child.href === activeHref) {
        return true;
      }

      const nested = collectOpenNodeIds([child], activeHref, open);
      return nested.has(child.id);
    });

    if (childContainsActive) {
      open.add(node.id);
    }
  });

  return open;
}

function EndpointNavNode({
  node,
  level,
  expanded,
  activeHref,
  onToggle,
  onNavigate,
}: NodeProps) {
  const isOpen = expanded.has(node.id);

  if (node.type === "endpoint") {
    const isActive = node.href === activeHref;

    return (
      <Link
        href={node.href ?? "#"}
        onClick={onNavigate}
        className={isActive ? "endpoint-link endpoint-link-active" : "endpoint-link"}
        style={{ paddingLeft: `${Math.max(level, 0) * 12 + 10}px` }}
      >
        {node.method ? <MethodBadge method={node.method} compact /> : null}
        <span className="endpoint-link-label">{node.label}</span>
      </Link>
    );
  }

  return (
    <div className="endpoint-group">
      <button
        type="button"
        className="endpoint-group-button"
        onClick={() => onToggle(node.id)}
        style={{ paddingLeft: `${Math.max(level, 0) * 12 + 8}px` }}
        aria-expanded={isOpen}
      >
        <ChevronRight
          size={14}
          className={isOpen ? "endpoint-chevron endpoint-chevron-open" : "endpoint-chevron"}
          aria-hidden="true"
        />
        <span>{node.label}</span>
      </button>
      {isOpen ? (
        <div className="endpoint-group-children">
          {node.children.map((child) => (
            <EndpointNavNode
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              activeHref={activeHref}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function EndpointNav({ nodes, activeHref, onNavigate }: EndpointNavProps) {
  const openByDefault = useMemo(() => collectOpenNodeIds(nodes, activeHref), [nodes, activeHref]);
  const [expanded, setExpanded] = useState(openByDefault);

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  return (
    <nav className="endpoint-nav" aria-label="Endpoint navigation">
      {nodes.map((node) => (
        <EndpointNavNode
          key={node.id}
          node={node}
          level={0}
          expanded={expanded}
          activeHref={activeHref}
          onToggle={toggle}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

export function EndpointNavDrawer({ nodes, activeHref }: EndpointNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav-shell">
      <button type="button" className="mobile-nav-trigger" onClick={() => setOpen(true)}>
        <Menu size={18} />
        Endpoints
      </button>
      {open ? (
        <div className="mobile-nav-overlay" role="dialog" aria-modal="true" aria-label="Endpoint navigation">
          <button type="button" className="mobile-nav-backdrop" onClick={() => setOpen(false)} aria-label="Close navigation" />
          <div className="mobile-nav-panel">
            <div className="mobile-nav-header">
              <span>Endpoints</span>
              <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close navigation">
                <X size={18} />
              </button>
            </div>
            <EndpointNav nodes={nodes} activeHref={pathname || activeHref} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
