"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Headphones, Menu, X } from "lucide-react";
import type { NavNode } from "@/lib/openapi";
import { MethodBadge } from "@/components/MethodBadge";

interface EndpointNavProps {
  nodes: NavNode[];
  activeHref: string;
  title?: string;
  ariaLabel?: string;
  storageKey?: string;
  showSupport?: boolean;
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

function collectDefaultOpenNodeIds(nodes: NavNode[]): Set<string> {
  const open = new Set<string>();

  function visit(node: NavNode) {
    if (node.defaultOpen) {
      open.add(node.id);
    }

    node.children.forEach((child) => visit(child));
  }

  nodes.forEach(visit);

  return open;
}

function collectActiveOpenNodeIds(nodes: NavNode[], activeHref: string): Set<string> {
  const open = new Set<string>();

  function visit(node: NavNode): boolean {
    const containsActiveChild = node.children.some((child) => visit(child));

    if (containsActiveChild) {
      open.add(node.id);
    }

    return node.href === activeHref || containsActiveChild;
  }

  nodes.forEach(visit);

  return open;
}

function readStoredOpenNodeIds(storageKey: string): Set<string> | undefined {
  try {
    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return undefined;
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return undefined;
    }

    return new Set(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return undefined;
  }
}

function writeStoredOpenNodeIds(storageKey: string, expanded: Set<string>) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(expanded)));
  } catch {
    // localStorage can be unavailable in private browsing or restricted embeds.
  }
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
    <div className={level === 0 ? "endpoint-group endpoint-group-root" : "endpoint-group"}>
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

export function EndpointNav({
  nodes,
  activeHref,
  title = "Endpoints",
  ariaLabel = "Endpoint navigation",
  storageKey = `endpoint-nav:${title}`,
  showSupport = true,
  onNavigate,
}: EndpointNavProps) {
  const defaultOpenIds = useMemo(() => collectDefaultOpenNodeIds(nodes), [nodes]);
  const activeOpenIds = useMemo(() => collectActiveOpenNodeIds(nodes, activeHref), [nodes, activeHref]);
  const openByDefault = useMemo(() => new Set([...defaultOpenIds, ...activeOpenIds]), [activeOpenIds, defaultOpenIds]);
  const [expanded, setExpanded] = useState(openByDefault);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredOpenNodeIds(storageKey);
    const next = new Set(stored ?? defaultOpenIds);

    activeOpenIds.forEach((id) => next.add(id));

    setExpanded(next);
    setHydrated(true);
  }, [activeOpenIds, defaultOpenIds, storageKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeStoredOpenNodeIds(storageKey, expanded);
  }, [expanded, hydrated, storageKey]);

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
    <div className="endpoint-nav-card">
      <div className="endpoint-nav-heading">
        <span>{title}</span>
      </div>
      <nav className="endpoint-nav" aria-label={ariaLabel}>
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
      {showSupport ? (
        <div className="endpoint-support-card">
          <span>Need help?</span>
          <p>Contact our support team for integration questions.</p>
          <button type="button">
            <Headphones size={14} aria-hidden="true" />
            Contact Support
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function EndpointNavDrawer({
  nodes,
  activeHref,
  title = "Endpoints",
  ariaLabel = "Endpoint navigation",
  storageKey,
  showSupport,
}: EndpointNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav-shell">
      <button type="button" className="mobile-nav-trigger" onClick={() => setOpen(true)}>
        <Menu size={18} />
        {title}
      </button>
      {open ? (
        <div className="mobile-nav-overlay" role="dialog" aria-modal="true" aria-label={ariaLabel}>
          <button type="button" className="mobile-nav-backdrop" onClick={() => setOpen(false)} aria-label="Close navigation" />
          <div className="mobile-nav-panel">
            <div className="mobile-nav-header">
              <span>{title}</span>
              <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close navigation">
                <X size={18} />
              </button>
            </div>
            <EndpointNav
              nodes={nodes}
              activeHref={pathname || activeHref}
              title={title}
              ariaLabel={ariaLabel}
              storageKey={storageKey}
              showSupport={showSupport}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
