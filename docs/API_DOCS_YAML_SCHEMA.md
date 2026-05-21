# YAML Schema for Documentation Content

This file describes the expected content model for the documentation website.

The exact folder structure can be adapted to the existing project, but the content model should remain consistent.

---

# 1. Recommended file structure

```txt
/content
  /api
    navigation.yaml
    /endpoints
      create-user.yaml
      get-user.yaml
      delete-user.yaml

  /articles
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

- `sections` defines the API navigation tree.
- `title` is displayed in the sidebar.
- `id` is a stable internal identifier.
- `defaultOpen` controls initial expanded state.
- `items` contains endpoints.
- `slug` must match an endpoint content file or endpoint slug.
- Order in YAML is the order in the UI.

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

# 3. API endpoint schema

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

# 4. Required endpoint fields

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

# 5. Parameter object schema

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
```

Example:

```yaml
- name: limit
  type: integer
  required: false
  description: Minimum 1, maximum 100.
```

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

Optional future fields:

```yaml
children:
  - name: string
    type: string
    required: boolean
    description: string
items:
  type: string
  description: string
example: any
default: any
```

---

# 6. Response object schema

```yaml
status: number|string
description: string
parameters:
  - name: string
    type: string
    description: string
```

Response parameters do not include required/optional status.

Example:

```yaml
responses:
  - status: 200
    description: Successful response.
    parameters:
      - name: id
        type: string
        description: Unique object identifier.
```

---

# 7. Custom block schema

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

# 8. Code example schema

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

# 9. Article navigation schema

File:

```txt
/content/articles/navigation.yaml
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

- Article navigation is independent from API navigation.
- `slug` must match an article content file or article slug.
- Order in YAML is the order in the UI.
- `defaultOpen` controls initial expanded state.

---

# 10. Article page schema

File example:

```txt
/content/articles/pages/authentication.yaml
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

# 11. Required article fields

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

# 12. Article block schema

Articles may use plain Markdown in `content`.

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

# 13. Validation rules

The implementation should validate:

- duplicate endpoint slugs;
- duplicate article slugs;
- API navigation items that reference missing endpoints;
- article navigation items that reference missing pages;
- missing required endpoint fields;
- missing required article fields;
- invalid parameter arrays;
- invalid response arrays;
- invalid request example arrays;
- invalid response example arrays;
- invalid article content;
- invalid or missing navigation sections.

Required endpoint fields:

```yaml
slug
title
description
method
path
status
```

Required article fields:

```yaml
slug
title
content
```

---

# 14. Rendering rules

- Empty parameter groups should not render broken empty tables.
- Empty request examples should not break the request examples component.
- Empty response examples should not break the response examples component.
- Unknown optional fields should be ignored unless validation explicitly rejects them.
- Markdown content should be rendered safely.
- Hyperlinks should work between API pages and article pages.
