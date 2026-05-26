# Content Management Guide

This guide explains how documentation content should be managed after the platform is implemented.

---

# 1. Core idea

The documentation website should be managed through files.

For ordinary content work, a developer or content editor should not need to edit application code.

They should only edit:

- API navigation YAML;
- endpoint YAML files;
- guide navigation YAML;
- guide content YAML files;
- images/assets if needed.

---

# 2. How to add a new API endpoint

## Step 1. Create endpoint file

Create a file in:

```txt
/content/api/endpoints/{endpoint-slug}.yaml
```

Example:

```txt
/content/api/endpoints/list-users.yaml
```

Minimal endpoint:

```yaml
slug: list-users
title: List users
description: Returns a paginated list of users.
method: GET
path: /v1/users
status: stable

headerParameters:
  - name: Authorization
    type: string
    required: true
    description: >
      Bearer token. Format: `Bearer <token>`.

queryParameters:
  - name: limit
    type: integer
    required: false
    description: Maximum number of users to return. Minimum 1, maximum 100.

responses:
  - status: 200
    description: Successful response.
    parameters:
      - name: data
        type: array
        description: List of user objects.
      - name: hasMore
        type: boolean
        description: Whether more users are available.

requestExamples:
  - label: cURL
    language: bash
    code: |
      curl "https://api.example.com/v1/users?limit=10" \
        -H "Authorization: Bearer TOKEN"

responseExamples:
  - label: 200 Success
    language: json
    code: |
      {
        "data": [],
        "hasMore": false
      }
```

## Step 2. Add endpoint to API navigation

Edit:

```txt
/content/api/navigation.yaml
```

Add the endpoint under the required section:

```yaml
sections:
  - title: Users
    id: users
    defaultOpen: true
    items:
      - title: List users
        slug: list-users
```

## Step 3. Check the site

The endpoint should appear in the API Reference navigation and render as a page.

You can validate content without running a full build:

```bash
npm run validate:content
```

---

# 3. How to move an API endpoint to another section

Only edit:

```txt
/content/api/navigation.yaml
```

Move the item from one section to another:

```yaml
sections:
  - title: Admin
    id: admin
    items:
      - title: List users
        slug: list-users
```

No endpoint YAML file or application code should need to change.

Navigation groups must contain at least one item. If moving an endpoint leaves a section empty, remove that section from `navigation.yaml`.

---

# 4. How to edit API endpoint content

Open the endpoint file:

```txt
/content/api/endpoints/{endpoint-slug}.yaml
```

You can edit:

- title;
- description;
- method;
- path;
- status;
- header parameters;
- path parameters;
- query parameters;
- request body parameters;
- responses;
- custom blocks;
- request examples;
- response examples.

---

# 5. How to add request examples

Add items to `requestExamples`:

```yaml
requestExamples:
  - label: cURL
    language: bash
    code: |
      curl https://api.example.com/v1/users

  - label: JavaScript
    language: javascript
    code: |
      const response = await fetch('https://api.example.com/v1/users');
```

Rules:

- `label` is shown in the selector.
- `language` is used for highlighting if supported.
- `code` is shown in the code block.
- Labels are custom per endpoint.

---

# 6. How to add response examples

Add items to `responseExamples`:

```yaml
responseExamples:
  - label: 200 Success
    language: json
    code: |
      {
        "data": []
      }

  - label: 401 Unauthorized
    language: json
    code: |
      {
        "error": "Unauthorized"
      }
```

Rules:

- `label` is shown in the selector.
- `language` is used for highlighting if supported.
- `code` is shown in the code block.
- Labels are custom per endpoint.

---

# 7. How to add custom blocks to endpoint pages

Use `blocks`:

```yaml
blocks:
  - type: warning
    title: Important
    content: >
      This endpoint is available only for verified accounts.

  - type: note
    title: Retry behavior
    content: >
      Use an idempotency key for safe retries.
```

Supported block types should include:

- note;
- info;
- warning;
- danger;
- tip.

The block content should support Markdown-compatible formatting.

---

# 8. How to add a new guide

## Step 1. Create guide file

Create:

```txt
/content/guides/pages/{guide-slug}.yaml
```

Example:

```txt
/content/guides/pages/webhooks.yaml
```

Minimal guide:

```yaml
slug: webhooks
title: Webhooks
description: How to receive webhook events.

content: |
  # Webhooks

  Webhooks allow your application to receive event notifications.

  Use **HTTPS** endpoints and verify signatures.

  ```bash
  curl https://example.com/webhook
  ```

  Read more in the [API Reference](/api/list-users).
```

## Step 2. Add guide to guide navigation

Edit:

```txt
/content/guides/navigation.yaml
```

Add:

```yaml
sections:
  - title: Guides
    id: guides
    defaultOpen: true
    items:
      - title: Webhooks
        slug: webhooks
```

## Step 3. Check the site

The guide should appear in the guides navigation and render as a page.

You can validate content without running a full build:

```bash
npm run validate:content
```

---

# 9. How to add images to guides

Option 1: Markdown image in `content`:

```md
![Authentication flow](/images/auth-flow.png)
```

Option 2: structured block:

```yaml
blocks:
  - type: image
    src: /images/auth-flow.png
    alt: Authentication flow
    caption: Authentication flow
```

Both options are supported. Local image paths must be absolute public paths, for example `/images/auth-flow.png`, and the file must exist under `public/`.

---

# 10. How to link guides and API endpoints

Use normal hyperlinks:

```md
Read the [Authentication guide](/guides/authentication).
```

```md
See the [Create user endpoint](/api/create-user).
```

Exact route prefixes may follow existing project conventions.

---

# 11. What should not require code changes

These actions should not require editing application code:

- adding endpoint;
- editing endpoint;
- deleting endpoint from navigation;
- moving endpoint to another section;
- adding request example;
- adding response example;
- changing parameter tables;
- adding guide;
- editing guide;
- moving guide to another section;
- adding guide image;
- adding guide link;
- renaming navigation sections.

---

# 12. What may require code changes

These actions may require application changes:

- adding a brand new visual block type;
- changing layout;
- changing route conventions;
- adding CMS/admin panel;
- adding database;
- changing the content schema.
