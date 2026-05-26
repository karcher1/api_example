# Project instructions for Codex

This project is a documentation website with an existing layout/design.
The layout and visual structure are already approved and must not be redesigned unless explicitly requested.

## Main goal

Implement and complete the functional platform for documentation content driven by YAML/content files.

The site has two main documentation areas:

1. API Reference
2. Informational Guides section

Both areas must have their own independent navigation and content model. But it can have even more areas in the future.

## Important constraints

- Do not change the existing layout/design unless required for functionality.
- Do not redesign the website.
- Do not replace the current framework or rewrite the project from scratch.
- Prefer data-driven implementation.
- API endpoints must be created, edited, reordered, moved between navigation groups, and deleted through simple YAML/content files.
- Guide pages must also be created, edited, reordered, moved, and deleted through simple YAML/content files.
- Avoid hardcoded endpoint lists, guide lists, request examples, response examples, languages, statuses, or navigation sections.
- Navigation state must behave according to the specification in `docs/API_DOCS_PLATFORM_SPEC.md`.
- YAML/content schema must follow `docs/API_DOCS_YAML_SCHEMA.md`.
- If the current implementation already has compatible structures, extend them instead of rewriting from scratch.
- Preserve existing UI components where possible.
- Add validation where practical to prevent broken documentation content.

## Source of truth

Read these files before implementing documentation functionality:

- `docs/API_DOCS_PLATFORM_SPEC.md`
- `docs/API_DOCS_YAML_SCHEMA.md`
- `docs/CODEX_IMPLEMENTATION_PROMPT.md`
- `docs/CODEX_TASK_CHECKLIST.md`
- `docs/CONTENT_MANAGEMENT_GUIDE.md`

## Functional requirements summary

The website must support two independent documentation areas:

### API Reference

- Own navigation tree generated from YAML/content files.
- Endpoint pages generated from YAML/content files.
- Endpoint metadata: title, description, method, path, status.
- Parameter groups: header, path, query, request body.
- Response parameters grouped by status.
- Custom blocks: note, info, warning, danger, tip.
- Markdown-compatible formatted text.
- Request examples with custom selector options per endpoint.
- Response examples with custom selector options per endpoint.

### Informational Guides

- Own navigation tree generated from YAML/content files.
- Guide pages generated from YAML/content files.
- Markdown-compatible content.
- Support for headings, text, bold, italic, inline code, code blocks, hyperlinks, images, examples, notes, warnings, and info blocks.

## Navigation behavior

- API Reference and Guides must have independent navigation trees.
- Navigation sections must be expanded by default on first entry.
- Expanded/collapsed state must be preserved during navigation.
- Active page must be highlighted.
- Page refresh and direct URL navigation must highlight the correct navigation item.

## Definition of done

The implementation is considered complete only when:

- API Reference navigation is generated from content/config files.
- Informational Guides navigation is generated from its own content/config files.
- API endpoint pages render all required sections from YAML.
- Endpoint request examples and response examples work with custom selectors.
- Guide pages support rich formatted content.
- Active navigation item is highlighted.
- Navigation sections are expanded by default on first entry.
- Expanded/collapsed state is preserved during navigation.
- Adding a new endpoint or guide requires only adding/editing content files, not changing application code.
- Existing layout remains visually unchanged.

## Non-goals

Do not implement these unless explicitly requested later:

- CMS/admin panel.
- Database.
- User authentication.
- OpenAPI import.
- SDK generation.
- Automatic API testing.
- New visual design system.
