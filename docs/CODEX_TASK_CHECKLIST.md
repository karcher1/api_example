# Codex Task Checklist

Use this checklist to verify the implementation.

---

# 1. Layout preservation

- [ ] Existing layout/design remains unchanged.
- [ ] Existing header structure is reused.
- [ ] Existing sidebar/navigation visual components are reused where possible.
- [ ] Existing request examples area is reused.
- [ ] Existing response examples area is reused or extended consistently.
- [ ] No unnecessary redesign was introduced.

---

# 2. Header sections

- [ ] Header contains access to API Reference.
- [ ] Header contains access to the informational/articles section.
- [ ] The two sections route to separate documentation areas.
- [ ] Header behavior remains consistent with the existing layout.

---

# 3. API Reference navigation

- [ ] API navigation is loaded from YAML/content config.
- [ ] API navigation supports sections/groups.
- [ ] API navigation supports manual order.
- [ ] API navigation supports moving endpoint items between sections by editing YAML.
- [ ] API navigation supports adding/removing/renaming sections by editing YAML.
- [ ] Endpoint list is not hardcoded in application code.
- [ ] Sections are expanded by default on first entry.
- [ ] Expanded/collapsed state is preserved while moving between pages.
- [ ] Navigation does not auto-collapse after clicking another endpoint.
- [ ] Active endpoint is highlighted.
- [ ] Active state works after page refresh.
- [ ] Active state works on direct URL navigation.
- [ ] Active state works with browser back/forward.

---

# 4. API endpoint content

- [ ] Endpoint pages are generated from YAML/content files.
- [ ] Endpoint slug is read from content.
- [ ] Endpoint title is rendered.
- [ ] Endpoint description is rendered.
- [ ] Endpoint method is rendered.
- [ ] Endpoint path is rendered.
- [ ] Endpoint status is rendered.
- [ ] Markdown-compatible formatting works in description.
- [ ] Hyperlinks work in endpoint content.

---

# 5. API parameters

- [ ] Header parameters render correctly.
- [ ] Path parameters render correctly.
- [ ] Query parameters render correctly.
- [ ] Request body parameters render correctly.
- [ ] Each request-side parameter supports name, type, required, description.
- [ ] Required/optional state is displayed for request-side parameters.
- [ ] Empty parameter groups do not render broken empty tables.
- [ ] Nested request body parameters are supported or safely ignored according to implementation decision.

---

# 6. API responses

- [ ] Responses are grouped by status.
- [ ] Response status is rendered.
- [ ] Response description is rendered.
- [ ] Response parameters render name, type, description.
- [ ] Response parameters do not display required/optional status.
- [ ] Multiple response statuses work.
- [ ] Response statuses are not hardcoded.
- [ ] Empty response parameter lists do not break UI.

---

# 7. Custom blocks

- [ ] Endpoint pages support note blocks.
- [ ] Endpoint pages support info blocks.
- [ ] Endpoint pages support warning blocks.
- [ ] Endpoint pages support danger blocks or a safe fallback.
- [ ] Endpoint pages support tip blocks or a safe fallback.
- [ ] Custom block content supports Markdown-compatible formatting.
- [ ] Blocks can be placed in page flow from content file.
- [ ] Unknown block types do not crash the page.

---

# 8. Request examples

- [ ] Request examples are loaded from endpoint YAML.
- [ ] Request examples selector is populated from endpoint data.
- [ ] Selector labels are custom per endpoint.
- [ ] There is no fixed language list.
- [ ] Each option has label, language, code.
- [ ] Selecting an option changes the displayed code.
- [ ] Code block preserves formatting.
- [ ] Syntax highlighting uses language when available.
- [ ] Endpoints without request examples do not break UI.

---

# 9. Response examples

- [ ] Response examples are loaded from endpoint YAML.
- [ ] Response examples selector is populated from endpoint data.
- [ ] Selector labels are custom per endpoint.
- [ ] There is no fixed response name/status list.
- [ ] Each option has label, language, code.
- [ ] Selecting an option changes the displayed code.
- [ ] Code block preserves formatting.
- [ ] Syntax highlighting uses language when available.
- [ ] Endpoints without response examples do not break UI.

---

# 10. Articles section

- [ ] Articles section has its own navigation.
- [ ] Article navigation is loaded from YAML/content config.
- [ ] Article navigation is independent from API navigation.
- [ ] Article navigation supports sections/groups.
- [ ] Article navigation supports manual order.
- [ ] Article navigation supports moving articles between sections by editing YAML.
- [ ] Article list is not hardcoded in application code.
- [ ] Article active state is highlighted.
- [ ] Article active state works on direct URL navigation and refresh.

---

# 11. Article content

- [ ] Article pages are generated from content files.
- [ ] Article title is rendered.
- [ ] Article description is rendered if present.
- [ ] Markdown headings work.
- [ ] Bold text works.
- [ ] Italic text works.
- [ ] Inline code works.
- [ ] Code blocks work.
- [ ] Hyperlinks work.
- [ ] Lists work.
- [ ] Images work.
- [ ] Alt text is supported for images.
- [ ] Optional captions are supported or safely ignored.
- [ ] Note/warning/info blocks work if implemented.

---

# 12. Routing

- [ ] API Reference base route works.
- [ ] Individual endpoint routes work.
- [ ] Articles base route works.
- [ ] Individual article routes work.
- [ ] Direct route navigation works.
- [ ] Refreshing an endpoint page works.
- [ ] Refreshing an article page works.
- [ ] Links between articles and API endpoints work.

---

# 13. Validation and errors

- [ ] Missing required endpoint fields are detected.
- [ ] Missing required article fields are detected.
- [ ] Duplicate endpoint slugs are detected.
- [ ] Duplicate article slugs are detected.
- [ ] API navigation references to missing endpoints are detected.
- [ ] Article navigation references to missing articles are detected.
- [ ] Invalid parameter arrays are detected or handled safely.
- [ ] Invalid response arrays are detected or handled safely.
- [ ] Invalid examples are detected or handled safely.
- [ ] Errors are understandable during development/build.

---

# 14. Content management acceptance tests

- [ ] Add a new endpoint YAML file.
- [ ] Add the endpoint slug to API navigation YAML.
- [ ] Confirm the endpoint appears in navigation.
- [ ] Confirm the endpoint page renders.
- [ ] Move the endpoint to another section by editing navigation YAML only.
- [ ] Confirm the endpoint moves in UI.
- [ ] Add a new article content file.
- [ ] Add the article slug to article navigation YAML.
- [ ] Confirm the article appears in navigation.
- [ ] Confirm the article page renders.
- [ ] Remove an endpoint from navigation and confirm it no longer appears.
- [ ] Remove an article from navigation and confirm it no longer appears.

---

# 15. Final verification

- [ ] Dev server runs successfully.
- [ ] Build runs successfully if the project has a build command.
- [ ] Existing tests pass if the project has tests.
- [ ] New validation/tests are added if appropriate.
- [ ] Final response explains how to add endpoints and articles.
