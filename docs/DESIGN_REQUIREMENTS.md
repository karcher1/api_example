# Design Requirements

This file documents design invariants that must remain consistent across the documentation site.

## Typography

The source of truth for global font stacks is `app/globals.css`:

- `--font-sans` controls all standard UI and documentation text.
- `--font-mono` controls technical text such as inline code, code blocks, API paths, methods, schema names, statuses, and request or response examples.

All public sections must use the same sans-serif stack for ordinary text:

- API Reference
- Guides
- Webhooks
- Header and navigation UI

Do not add page-specific or section-specific `font-family` declarations for regular content. Headings, paragraphs, tables, notices, navigation labels, and guide content should inherit from `body` unless there is a specific technical-text reason to use `--font-mono`.

Do not introduce serif font stacks for documentation headings or guide pages.

## Changing Fonts

To change the site font globally, update the variables in `app/globals.css`.

If Tailwind font utilities are used, keep `tailwind.config.ts` mapped to the same variables:

- `font-sans` must use `var(--font-sans)`.
- `font-mono` must use `var(--font-mono)`.

Changing individual pages or components directly is not allowed for ordinary typography changes.

## Verification

Before shipping typography changes, run:

```bash
npm run lint
npm run typecheck
npm run build
```

Also check one page from each public documentation area:

- API Reference
- Guides
- Webhooks

Inline code and code blocks should remain monospace. Normal headings and body text should remain sans-serif everywhere.
