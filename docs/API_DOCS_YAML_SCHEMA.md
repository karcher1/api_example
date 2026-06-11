# YAML Schema for Documentation Content

This file describes the expected content model for the documentation website.

The exact folder structure can be adapted to the existing project, but the content model should remain consistent.

---

# 1. Recommended file structure

```txt
/content
  /api
    navigation.yaml
    /pages
      endpoint-response-errors.yaml
    /endpoints
      create-user.yaml
      get-user.yaml
      delete-user.yaml

  /guides
    navigation.yaml
    /pages
      authentication.yaml
      webhooks.yaml
      errors.yaml
```

Alternative structures are acceptable if they fit the current project better, but the implementation must stay file-driven and easy to edit.

---

# 2. API navigation schema

File:

```txt
/content/api/navigation.yaml
```

Example:

```yaml
items:
  - title: Endpoint response errors
    slug: endpoint-response-errors

sections:
  - title: Users
    id: users
    defaultOpen: true
    items:
      - title: Create user
        slug: create-user
      - title: Get user
        slug: get-user

  - title: Payments
    id: payments
    defaultOpen: true
    items:
      - title: Create payment
        slug: create-payment
      - title: Refund payment
        slug: refund-payment
```

Rules:

- Optional root-level `items` defines standalone API navigation links rendered before collapsible sections.
- Root-level `items` can link to API endpoint files or API article page files.
- `sections` defines the API navigation tree.
- `title` is displayed in the sidebar.
- `id` is a stable internal identifier.
- `defaultOpen` controls initial expanded state.
- `items` contains endpoints.
- `slug` must match an endpoint content file, an API article content file, or the corresponding content slug.
- Order in YAML is the order in the UI.
- Navigation groups must contain at least one item.
- A navigation item must not define both `slug` and nested `items`.

Nested groups can be supported if needed:

```yaml
sections:
  - title: Users
    id: users
    items:
      - title: Management
        id: user-management
        items:
          - title: Create user
            slug: create-user
```

---

# 3. API article page schema

File example:

```txt
/content/api/pages/endpoint-response-errors.yaml
```

Example:

```yaml
slug: endpoint-response-errors
title: Endpoint response errors
description: Error response contracts and charge failure reason mapping.

content: |
  # Endpoint response errors

  Use this page for API reference content that is not a single HTTP endpoint.

  | Attribute | Type | Description |
  | --- | --- | --- |
  | code | integer | Error code |

examples:
  - label: "400"
    language: json
    code: |
      {
        "code": 400,
        "message": "Bad request"
      }
```

Required fields:

```yaml
slug: string
title: string
content: string
```

Recommended optional fields:

```yaml
description: string
blocks: array
examples: array
```

Rules:

- API article pages live under `/content/api/pages`.
- `slug` must match the YAML filename and resolves to `/api/{slug}`.
- API article slugs must not duplicate endpoint slugs because both share the same route namespace.
- Use API article pages for reference content that belongs in API Reference navigation but does not have endpoint metadata like `method` and `path`.
- `examples` uses the same `label`, `language`, and `code` shape as endpoint examples and renders in the API article right panel when present.

---

# 4. API endpoint schema

File example:

```txt
/content/api/endpoints/create-user.yaml
```

Example:

```yaml
slug: create-user
title: Create user
description: >
  Creates a new user account. Use **Authorization** header with a valid token.
method: POST
path: /v1/users
status: stable

headerParameters:
  - name: Authorization
    type: string
    required: true
    description: >
      Bearer token. Format: `Bearer <token>`.

  - name: Content-Type
    type: string
    required: true
    description: Must be `application/json`.

pathParameters: []

queryParameters:
  - name: sendWelcomeEmail
    type: boolean
    required: false
    description: Whether to send a welcome email after user creation.

requestBodyParameters:
  - name: email
    type: string
    required: true
    description: User email address. Must be a valid email.

  - name: name
    type: string
    required: false
    description: User display name. Maximum 100 characters.

responses:
  - status: 201
    description: User created successfully.
    parameters:
      - name: id
        type: string
        description: Unique user identifier.

      - name: email
        type: string
        description: User email address.

      - name: createdAt
        type: string
        description: Creation date in ISO 8601 format.

  - status: 400
    description: Validation error.
    parameters:
      - name: error
        type: string
        description: Error message.

blocks:
  - type: warning
    title: Verification required
    content: >
      This endpoint is available only for verified accounts.

  - type: note
    title: Idempotency
    content: >
      Use an idempotency key if you need safe retries.

requestExamples:
  - label: cURL
    language: bash
    code: |
      curl -X POST "https://api.example.com/v1/users" \
        -H "Authorization: Bearer TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
          "email": "user@example.com",
          "name": "John Doe"
        }'

  - label: PHP
    language: php
    code: |
      <?php

      $payload = [
          "email" => "user@example.com",
          "name" => "John Doe",
      ];

responseExamples:
  - label: 201 Created
    language: json
    code: |
      {
        "id": "usr_123",
        "email": "user@example.com",
        "createdAt": "2026-01-01T00:00:00Z"
      }

  - label: 400 Validation Error
    language: json
    code: |
      {
        "error": "Invalid email"
      }
```

---

# 5. Required endpoint fields

```yaml
slug: string
title: string
description: string
method: string
path: string
status: string
```

Recommended validation:

- `slug` must be unique.
- `title` must not be empty.
- `method` must not be empty.
- `path` must start with `/` unless the current project uses another convention.
- `status` must not be empty.

---

# 6. Parameter object schema

Used by:

- `headerParameters`
- `pathParameters`
- `queryParameters`
- `requestBodyParameters`

```yaml
name: string
type: string
required: boolean
description: string
standard: string # optional, displayed for pathParameters and requestBodyParameters
```

Example:

```yaml
- name: limit
  type: integer
  required: false
  description: Minimum 1, maximum 100.
```

`standard` is optional. When provided on `pathParameters` or `requestBodyParameters`, it is displayed as a separate badge instead of being included in `description`.

Supported `type` values should not be strictly hardcoded unless validation needs them.

Common examples:

- string
- integer
- number
- boolean
- object
- array
- enum
- date
- datetime
- uuid

Optional fields:

```yaml
standard: string
children:
  - name: string
    type: string
    required: boolean
    description: string
    standard: string
items:
  type: string
  description: string
  standard: string
example: any
default: any
```

---

# 7. Response object schema

```yaml
status: number|string
description: string
parameters:
  - name: string
    type: string
    description: string
    children:
      - name: string
        type: string
        description: string
    items:
      type: string
      description: string
```

Response parameters do not include required/optional status.
Nested response parameters can use `children` for object fields and `items` for array item schemas. Unlike request parameters, response child fields do not require `required`.

Example:

```yaml
responses:
  - status: 200
    description: Successful response.
    parameters:
      - name: id
        type: string
        description: Unique object identifier.
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

---

# 8. Custom block schema

```yaml
type: note|info|warning|danger|tip|string
title: string
content: string
```

Example:

```yaml
- type: info
  title: Sandbox mode
  content: >
    This endpoint can be tested in sandbox mode.
```

The block `content` should support Markdown-compatible formatting.

Block types should be flexible. If an unknown block type is provided, the UI should either render it with a neutral/default style or show a development warning.

---

# 9. Code example schema

Used by:

- `requestExamples`
- `responseExamples`

```yaml
label: string
language: string
code: string
```

`label` is displayed in selector.
`language` is used for syntax highlighting.
`code` is displayed in the code block.

The list of labels is fully custom per endpoint.

Example:

```yaml
requestExamples:
  - label: cURL
    language: bash
    code: |
      curl https://api.example.com/v1/users
```

---

# 10. Guide navigation schema

File:

```txt
/content/guides/navigation.yaml
```

Example:

```yaml
sections:
  - title: Getting Started
    id: getting-started
    defaultOpen: true
    items:
      - title: Introduction
        slug: introduction
      - title: Authentication
        slug: authentication

  - title: Guides
    id: guides
    defaultOpen: true
    items:
      - title: Webhooks
        slug: webhooks
      - title: Error handling
        slug: error-handling
```

Rules:

- Guide navigation is independent from API navigation.
- `slug` must match a guide content file or guide slug.
- Order in YAML is the order in the UI.
- `defaultOpen` controls initial expanded state.
- Navigation groups must contain at least one item.
- A navigation item must not define both `slug` and nested `items`.

---

# 11. Guide page schema

File example:

```txt
/content/guides/pages/authentication.yaml
```

Example:

```yaml
slug: authentication
title: Authentication
description: How to authenticate API requests.

content: |
  # Authentication

  To authenticate API requests, pass the `Authorization` header.

  ```bash
  curl -H "Authorization: Bearer TOKEN" https://api.example.com/v1/users
  ```

  You can read more in the [Create user endpoint](/api/create-user).

blocks:
  - type: info
    title: Token security
    content: >
      Keep your API tokens private and never expose them in frontend code.

  - type: image
    src: /images/auth-flow.png
    alt: Authentication flow
    caption: Authentication flow
```

---

# 12. Required guide fields

```yaml
slug: string
title: string
content: string
```

Recommended optional fields:

```yaml
description: string
blocks: array
```

---

# 13. Guide block schema

Guides may use plain Markdown in `content`.

Optional structured blocks can be supported:

```yaml
blocks:
  - type: image
    src: string
    alt: string
    caption: string

  - type: note
    title: string
    content: string

  - type: warning
    title: string
    content: string

  - type: info
    title: string
    content: string

  - type: code
    language: string
    code: string
```

---

# 14. Validation rules

The implementation should validate:

- duplicate endpoint slugs;
- duplicate guide slugs;
- API navigation items that reference missing endpoints;
- guide navigation items that reference missing pages;
- missing required endpoint fields;
- missing required guide fields;
- invalid parameter arrays;
- invalid response arrays;
- invalid request example arrays;
- invalid response example arrays;
- invalid guide content;
- invalid or missing navigation sections.
- content `slug` values that do not match their YAML filename;
- duplicate request/response example labels or selector IDs;
- local Markdown image paths that do not point to existing files in `public/`;
- empty navigation groups.

Required endpoint fields:

```yaml
slug
title
description
method
path
status
```

Required guide fields:

```yaml
slug
title
content
```

---

# 15. Rendering rules

- Empty parameter groups should not render broken empty tables.
- Empty request examples should not break the request examples component.
- Empty response examples should not break the response examples component.
- Unknown optional fields should be ignored unless validation explicitly rejects them.
- Markdown content should be rendered safely.
- Hyperlinks should work between API pages and guide pages.
