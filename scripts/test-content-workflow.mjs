#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parse, stringify } from "yaml";

const projectRoot = process.cwd();
const validatorPath = path.join(projectRoot, "scripts", "validate-content.mjs");

function readYaml(filePath) {
  return parse(fs.readFileSync(filePath, "utf8"));
}

function writeYaml(filePath, value) {
  fs.writeFileSync(filePath, stringify(value), "utf8");
}

function runValidation(root, label) {
  const result = spawnSync(process.execPath, [validatorPath, "--root", root], {
    cwd: projectRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(
      [
        `Content workflow validation failed during "${label}".`,
        result.stdout.trim(),
        result.stderr.trim(),
      ].filter(Boolean).join("\n"),
    );
  }

  console.log(`✓ ${label}`);
}

function addSection(navPath, section) {
  const nav = readYaml(navPath);

  nav.sections.push(section);
  writeYaml(navPath, nav);
}

function replaceSection(navPath, oldId, nextSection) {
  const nav = readYaml(navPath);

  nav.sections = nav.sections.filter((section) => section.id !== oldId);
  nav.sections.push(nextSection);
  writeYaml(navPath, nav);
}

function removeSection(navPath, sectionId) {
  const nav = readYaml(navPath);

  nav.sections = nav.sections.filter((section) => section.id !== sectionId);
  writeYaml(navPath, nav);
}

function writeEndpointFixture(root) {
  const filePath = path.join(root, "content", "api", "endpoints", "list-users.yaml");

  fs.writeFileSync(
    filePath,
    `slug: list-users
title: List users
description: Returns a paginated list of users.
method: GET
path: /v1/users
status: stable

queryParameters:
  - name: limit
    type: integer
    required: false
    description: Maximum number of users to return.

responses:
  - status: 200
    description: Successful response.
    parameters:
      - name: data
        type: array
        description: List of user objects.

requestExamples:
  - label: cURL
    language: bash
    code: |
      curl "https://api.example.com/v1/users?limit=10"

responseExamples:
  - label: 200 Success
    language: json
    code: |
      {
        "data": []
      }
`,
  );
}

function writeArticleFixture(root) {
  const filePath = path.join(root, "content", "articles", "pages", "workflow-test.yaml");

  fs.writeFileSync(
    filePath,
    `slug: workflow-test
title: Workflow Test
description: Temporary content workflow article.

content: |
  # Workflow Test

  This page verifies article creation through YAML.

  ![Authentication flow](/images/auth-flow.svg)
`,
  );
}

function writeWebhookFixture(root) {
  const filePath = path.join(root, "content", "webhooks", "pages", "workflow-webhook.yaml");

  fs.writeFileSync(
    filePath,
    `slug: workflow-webhook
title: Workflow Webhook
description: Temporary content workflow webhook page.

content: |
  # Workflow Webhook

  This page verifies webhook documentation creation through YAML.

  | Event | Action |
  | --- | --- |
  | workflow_event | workflow |

  \`\`\`json
  {
    "type": "workflow"
  }
  \`\`\`
`,
  );
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "api-docs-content-workflow-"));

try {
  fs.cpSync(path.join(projectRoot, "content"), path.join(tempRoot, "content"), { recursive: true });

  if (fs.existsSync(path.join(projectRoot, "public"))) {
    fs.cpSync(path.join(projectRoot, "public"), path.join(tempRoot, "public"), { recursive: true });
  }

  const apiNavPath = path.join(tempRoot, "content", "api", "navigation.yaml");
  const articleNavPath = path.join(tempRoot, "content", "articles", "navigation.yaml");
  const webhookNavPath = path.join(tempRoot, "content", "webhooks", "navigation.yaml");

  runValidation(tempRoot, "base content validates");

  writeEndpointFixture(tempRoot);
  addSection(apiNavPath, {
    title: "Workflow API",
    id: "workflow-api",
    defaultOpen: true,
    items: [{ title: "List users", slug: "list-users" }],
  });
  runValidation(tempRoot, "new endpoint file linked in API navigation");

  replaceSection(apiNavPath, "workflow-api", {
    title: "Workflow API Moved",
    id: "workflow-api-moved",
    defaultOpen: true,
    items: [{ title: "List users", slug: "list-users" }],
  });
  runValidation(tempRoot, "endpoint moved by editing API navigation only");

  removeSection(apiNavPath, "workflow-api-moved");
  runValidation(tempRoot, "endpoint removed from API navigation while file remains draft-routable");

  writeArticleFixture(tempRoot);
  addSection(articleNavPath, {
    title: "Workflow Articles",
    id: "workflow-articles",
    defaultOpen: true,
    items: [{ title: "Workflow Test", slug: "workflow-test" }],
  });
  runValidation(tempRoot, "new article file linked in article navigation");

  replaceSection(articleNavPath, "workflow-articles", {
    title: "Workflow Articles Moved",
    id: "workflow-articles-moved",
    defaultOpen: true,
    items: [{ title: "Workflow Test", slug: "workflow-test" }],
  });
  runValidation(tempRoot, "article moved by editing article navigation only");

  removeSection(articleNavPath, "workflow-articles-moved");
  runValidation(tempRoot, "article removed from article navigation while file remains draft-routable");

  writeWebhookFixture(tempRoot);
  addSection(webhookNavPath, {
    title: "Workflow Webhooks",
    id: "workflow-webhooks",
    defaultOpen: true,
    items: [{ title: "Workflow Webhook", slug: "workflow-webhook" }],
  });
  runValidation(tempRoot, "new webhook page linked in webhook navigation");

  replaceSection(webhookNavPath, "workflow-webhooks", {
    title: "Workflow Webhooks Moved",
    id: "workflow-webhooks-moved",
    defaultOpen: true,
    items: [{ title: "Workflow Webhook", slug: "workflow-webhook" }],
  });
  runValidation(tempRoot, "webhook page moved by editing webhook navigation only");

  removeSection(webhookNavPath, "workflow-webhooks-moved");
  runValidation(tempRoot, "webhook page removed from webhook navigation while file remains draft-routable");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
