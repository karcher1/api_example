# Documentation Platform Functional Specification

## 1. Purpose

The project is a documentation website.
The visual layout already exists and must remain unchanged.

The task is to complete the functional platform so that documentation content can be managed through simple YAML/content files instead of creating custom pages manually every time.

The website must support two independent documentation areas:

1. API Reference
2. Informational Guides section

These two areas work together inside one website but have separate navigation trees and separate content models.

---

## 2. Global website structure

### 2.1 Header

The website header must contain two main sections:

1. API Reference
2. Informational section

The exact title of the second section can be changed later, but functionally it is a separate documentation area for guides, explanations, tutorials, and other non-endpoint content.

### 2.2 Layout

The existing layout is approved.

Implementation must focus on functionality, data loading, rendering, state handling, and content management.

The existing layout, visual proportions, typography, spacing, and general page structure should not be changed unless required for functionality.

### 2.3 Content source

Documentation content should be file-driven.

Preferred source format:

- YAML for structured data;
- Markdown or Markdown-compatible strings for rich formatted text.

The ordinary documentation editing workflow should be:

1. Add or edit a YAML/content file.
2. Save the file.
3. The website reflects the change.
4. No application code changes are needed for ordinary documentation updates.

---

# 3. API Reference section

## 3.1 API Reference navigation

The API Reference section must have its own navigation.

Navigation must be managed manually through simple configuration/content files, preferably YAML.

The navigation must support:

- groups/sections;
- nested groups if the current layout supports them;
- endpoint items;
- manual ordering;
- moving endpoints between sections;
- renaming sections;
- adding new sections;
- deleting sections;
- adding, editing, deleting endpoints.

No endpoint should be hardcoded in application code.

### 3.1.1 Default expanded state

When the user opens the API Reference section for the first time, all navigation sections must be expanded by default.

A section-level `defaultOpen` field may exist in YAML, but the default behavior for API Reference should be expanded sections unless explicitly configured otherwise.

### 3.1.2 Preserve expanded state

When the user expands or collapses navigation sections and then moves between endpoint pages, the current expanded/collapsed state must be preserved.

Navigation must not automatically collapse after page transitions.

Acceptable implementation options:

- local component state preserved by layout-level navigation component;
- localStorage/sessionStorage;
- URL-independent state store;
- framework-specific persistent layout state.

### 3.1.3 Active page highlighting

The navigation must highlight the page currently opened by the user.

The active state must work for:

- direct URL navigation;
- clicking links inside the navigation;
- refreshing the page;
- browser back/forward navigation.

### 3.1.4 API navigation independence

API Reference navigation must be independent from the informational guides navigation.

Changes to API navigation must not affect the guide navigation.

---

# 4. API endpoint page

Each API endpoint page must be generated from a YAML/content file.

The endpoint content file must describe endpoint metadata, parameters, custom content blocks, request examples, and response examples.

## 4.1 Endpoint header

Each endpoint must have:

- title;
- description;
- method;
- path;
- status.

Example fields:

- `title`
- `description`
- `method`
- `path`
- `status`

The method can be values such as:

- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`
- `OPTIONS`
- `HEAD`

The status is a general endpoint status, for example:

- stable;
- beta;
- deprecated;
- experimental.

The exact list should not be hardcoded if avoidable.

## 4.2 Endpoint parameters

An endpoint can have the following parameter groups:

1. Header parameters
2. Path parameters
3. Query parameters
4. Request body parameters
5. Response parameters grouped by response status

All parameter groups are optional.
If a group is absent or empty, the UI should not render an empty block unless the current layout explicitly requires it.

## 4.3 Header parameters

Header parameters consist of:

- parameter name;
- type;
- mandatory status;
- description.

Mandatory status must support:

- required;
- optional.

The description field should also contain constraints, standards, minimum values, maximum values, format rules, and other notes.

Example:

```yaml
headerParameters:
  - name: Authorization
    type: string
    required: true
    description: Bearer token. Must follow the format `Bearer <token>`.
```

## 4.4 Path parameters

Path parameters consist of:

- parameter name;
- type;
- mandatory status;
- description.
- optional standard.

If `standard` is provided, it should be displayed separately from the description.

Example:

```yaml
pathParameters:
  - name: userId
    type: string
    required: true
    description: Unique user identifier.
    standard: uuid
```

## 4.5 Query parameters

Query parameters consist of:

- parameter name;
- type;
- mandatory status;
- description.

Example:

```yaml
queryParameters:
  - name: limit
    type: integer
    required: false
    description: Maximum number of items to return. Minimum 1, maximum 100.
```

## 4.6 Request body parameters

Request body parameters consist of:

- parameter name;
- type;
- mandatory status;
- description.
- optional standard.

If `standard` is provided, it should be displayed separately from the description.

Example:

```yaml
requestBodyParameters:
  - name: email
    type: string
    required: true
    description: User email address. Must be a valid email.
    standard: RFC 5322 email address
```

Request body parameters should support nested objects and arrays if the project needs this for real API documentation.

Recommended optional fields for future support:

- `children`
- `items`
- `example`
- `default`
- `standard`

Nested example:

```yaml
requestBodyParameters:
  - name: profile
    type: object
    required: false
    description: Optional user profile data.
    children:
      - name: firstName
        type: string
        required: false
        description: User first name.
      - name: lastName
        type: string
        required: false
        description: User last name.
        standard: ISO basic Latin letters
```

## 4.7 Response parameters

Response parameters are grouped by status code.

Each response status can have:

- status code;
- description;
- list of parameters.

Response parameters consist of:

- parameter name;
- type;
- description.

For response parameters, required/optional is not displayed.
Response parameters may optionally use `children` for nested object fields and `items` for array item schemas.

Example:

```yaml
responses:
  - status: 200
    description: Successful response.
    parameters:
      - name: id
        type: string
        description: Unique object identifier.
      - name: createdAt
        type: string
        description: Date and time in ISO 8601 format.
      - name: data
        type: object
        description: Response payload.
        children:
          - name: items
            type: array
            description: Returned records.
            items:
              type: object
              description: Returned record.
              children:
                - name: name
                  type: string
                  description: Record display name.
```

Responses must support multiple statuses, for example:

- `200`
- `201`
- `400`
- `401`
- `403`
- `404`
- `409`
- `422`
- `429`
- `500`

The list of statuses must not be hardcoded.

---

# 5. Custom content blocks inside endpoint pages

Endpoint pages must support custom content blocks.

These blocks can appear in different places on the page.
They are not strictly tied to one specific section.

Supported block types should include at least:

- note;
- info;
- warning;
- danger;
- tip.

The exact visual style should reuse existing layout/design components if available.

Example:

```yaml
blocks:
  - type: warning
    title: Important
    content: This endpoint is available only for verified accounts.
```

The implementation should be flexible enough to add more block types later.

If the current layout has no dedicated place for such blocks, render them in the main content flow in the order provided by the content file.

---

# 6. Rich formatted text

The platform must support formatted text in endpoint descriptions, custom blocks, and guide content.

Required formatting:

- bold;
- italic;
- inline code;
- code blocks;
- hyperlinks;
- lists;
- headings where appropriate.

Preferred approach: Markdown-compatible content fields.

Example:

```yaml
description: >
  Creates a new user. Use **Authorization** header with a valid token.
  See [Authentication Guide](/guides/authentication).
```

Markdown rendering must be safe and compatible with the current frontend framework.

---

# 7. Request examples

The layout already has a request examples area.

This area must be connected to endpoint data.

Each endpoint can define its own set of request examples.

The request examples block must contain:

- selector;
- selected example state;
- code block for selected example.

The selector options must be fully custom per endpoint.

The system must not depend on a fixed list of languages.

Examples can be named:

- PHP
- JavaScript
- cURL
- Python
- Custom SDK
- Any custom name

Each selector option must have its own code content.

Example:

```yaml
requestExamples:
  - label: cURL
    language: bash
    code: |
      curl -X POST "https://api.example.com/users" \
        -H "Authorization: Bearer TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"email":"user@example.com"}'

  - label: PHP
    language: php
    code: |
      <?php
      // PHP request example
```

`label` is displayed in the selector.
`language` is used only for syntax highlighting if available.
`code` is displayed in the code block.

If an endpoint has no request examples, the request examples area should not break the page.

---

# 8. Response examples

Response examples are displayed under request examples.

They work similarly to request examples.

Each endpoint can define its own response example selector.

The selector options must be custom per endpoint.

The system must not depend on a fixed list of response names or statuses.

Example:

```yaml
responseExamples:
  - label: 200 Success
    language: json
    code: |
      {
        "id": "usr_123",
        "email": "user@example.com"
      }

  - label: 400 Validation Error
    language: json
    code: |
      {
        "error": "Invalid email"
      }
```

If an endpoint has no response examples, the response examples area should not break the page.

---

# 9. Content management requirements for API Reference

It must be easy to:

- create a new endpoint;
- edit an endpoint;
- delete an endpoint;
- move an endpoint between navigation sections;
- reorder endpoints;
- add request examples;
- edit request examples;
- remove request examples;
- add response examples;
- edit response examples;
- remove response examples;
- add custom blocks;
- edit custom blocks;
- remove custom blocks;
- update parameter tables.

The desired workflow:

1. Create or edit YAML/content file.
2. Save file.
3. Website automatically reflects changes.
4. No application code changes are required for ordinary documentation updates.

---

# 10. Informational Guides section

## 10.1 Purpose

The second documentation section is for guides, explanations, tutorials, and other non-endpoint content.

It must be separate from the API Reference section.

## 10.2 Guide navigation

The guides section must have its own navigation.

Guide navigation must be managed through simple configuration/content files.

It must support:

- groups/sections;
- guide pages;
- manual ordering;
- moving guides between sections;
- renaming sections;
- adding sections;
- deleting sections;
- adding, editing, deleting guide pages.

No guide should be hardcoded in application code.

## 10.3 Guide content

Guides must support:

- text;
- headings;
- bold text;
- italic text;
- inline code;
- code blocks;
- hyperlinks;
- images;
- lists;
- examples;
- notes/warnings/info blocks if practical.

Markdown-compatible guide content is preferred.

Example guide features:

````md
# Authentication Guide

This guide explains how to authenticate requests.

Use the `Authorization` header.

```bash
curl -H "Authorization: Bearer TOKEN" https://api.example.com/users
```

[Read API Reference](/api/users/create)
````

## 10.4 Images in guides

Guides must support images.

Image requirements:

- image path or URL can be defined in content;
- alt text must be supported;
- optional caption can be supported;
- images must fit existing layout.

Example:

```yaml
blocks:
  - type: image
    src: /images/auth-flow.png
    alt: Authentication flow diagram
    caption: Authentication flow
```

---

# 11. Relationship between API Reference and Guides

The two sections must work together inside the same website.

Requirements:

- guides can link to API endpoints;
- API endpoint descriptions can link to guides;
- both sections must use normal hyperlinks;
- routing should support direct links to any endpoint or guide;
- active navigation must work independently for each section.

---

# 12. Routing

The website must support stable URLs for:

- API Reference section;
- each API endpoint;
- Guides section;
- each guide.

Recommended URL patterns:

```txt
/api
/api/{endpoint-slug}
/guides
/guides/{guide-slug}
```

The exact route names can follow the existing project conventions.

Direct navigation to a URL must render the correct page and highlight the correct navigation item.

---

# 13. Error and empty states

The implementation should handle missing or invalid content gracefully.

Required behavior:

- if an endpoint YAML file is missing required fields, the build or runtime should show a clear error;
- if navigation references a missing endpoint, the issue should be visible during development;
- if an endpoint has no request examples, the request examples block should not break the page;
- if an endpoint has no response examples, the response examples block should not break the page;
- if a parameter group is empty, the UI should avoid rendering useless empty tables;
- if a guide content file is invalid, the error should be understandable during development.

---

# 14. Validation

Prefer adding content validation for YAML files.

Validation should check:

- required endpoint fields;
- required guide fields;
- invalid navigation references;
- duplicate slugs;
- invalid parameter structures;
- invalid response arrays;
- invalid example arrays;
- missing guide files;
- missing endpoint files.

Validation can be implemented with the current stack's preferred validation library or custom checks.

---

# 15. Non-goals

The following are not required unless explicitly requested later:

- changing the visual layout;
- building a CMS/admin panel;
- connecting a database;
- user authentication;
- automatic OpenAPI import;
- automatic API testing;
- automatic SDK generation;
- changing the current framework;
- replacing existing UI components unnecessarily.

The current goal is a clean file-driven documentation platform.

---

# 16. Acceptance criteria

The feature is complete when all of the following are true:

1. API Reference navigation is generated from content/config files.
2. Guide navigation is generated from separate content/config files.
3. API Reference and Guides have independent navigation trees.
4. All API navigation groups are expanded by default on first entry.
5. Navigation expand/collapse state persists while moving between pages.
6. Current page is highlighted in the correct navigation.
7. A new endpoint can be added without changing application code.
8. A new guide can be added without changing application code.
9. Endpoint pages render title, description, method, path, and status.
10. Endpoint pages render header, path, query, request body, and response parameters.
11. Response parameters are grouped by status.
12. Endpoint pages support note/info/warning/custom blocks.
13. Endpoint pages support formatted text and hyperlinks.
14. Request examples selector works with custom options per endpoint.
15. Response examples selector works with custom options per endpoint.
16. Guide pages support formatted content, images, links, headings, and code examples.
17. Existing layout remains visually unchanged.
18. Empty sections do not render as broken UI.
19. Navigation references to missing content are detected during development or build.
20. Duplicate slugs are detected during development or build.
