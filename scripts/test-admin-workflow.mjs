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
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, stringify(value, { lineWidth: 0 }), "utf8");
}

function runValidation(root, label) {
  const result = spawnSync(process.execPath, [validatorPath, "--root", root], {
    cwd: projectRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(
      [
        `Admin workflow validation failed during "${label}".`,
        result.stdout.trim(),
        result.stderr.trim(),
      ].filter(Boolean).join("\n"),
    );
  }

  console.log(`✓ ${label}`);
}

function validateDraft(root, label) {
  const validationRoot = fs.mkdtempSync(path.join(os.tmpdir(), "api-docs-admin-draft-"));

  try {
    fs.mkdirSync(path.join(validationRoot, "content"), { recursive: true });
    fs.cpSync(path.join(root, "content", ".drafts", "api"), path.join(validationRoot, "content", "api"), {
      recursive: true,
    });
    fs.cpSync(path.join(root, "content", ".drafts", "articles"), path.join(validationRoot, "content", "articles"), {
      recursive: true,
    });

    if (fs.existsSync(path.join(root, "public"))) {
      fs.cpSync(path.join(root, "public"), path.join(validationRoot, "public"), { recursive: true });
    }

    runValidation(validationRoot, label);
  } finally {
    fs.rmSync(validationRoot, { recursive: true, force: true });
  }
}

function initializeDrafts(root) {
  const draftsRoot = path.join(root, "content", ".drafts");

  fs.mkdirSync(draftsRoot, { recursive: true });
  fs.cpSync(path.join(root, "content", "api"), path.join(draftsRoot, "api"), { recursive: true });
  fs.cpSync(path.join(root, "content", "articles"), path.join(draftsRoot, "articles"), { recursive: true });
}

function addNavigationItem(navPath, sectionId, item) {
  const nav = readYaml(navPath);
  const section = nav.sections.find((candidate) => candidate.id === sectionId);

  if (!section) {
    throw new Error(`Missing section ${sectionId} in ${navPath}.`);
  }

  section.items.push(item);
  writeYaml(navPath, nav);
}

function removeNavigationItem(navPath, slug) {
  const nav = readYaml(navPath);

  nav.sections = nav.sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.slug !== slug),
    }))
    .filter((section) => section.items.length > 0);

  writeYaml(navPath, nav);
}

function publishDrafts(root) {
  validateDraft(root, "draft validates before publish");

  fs.rmSync(path.join(root, "content", "api"), { recursive: true, force: true });
  fs.rmSync(path.join(root, "content", "articles"), { recursive: true, force: true });
  fs.cpSync(path.join(root, "content", ".drafts", "api"), path.join(root, "content", "api"), { recursive: true });
  fs.cpSync(path.join(root, "content", ".drafts", "articles"), path.join(root, "content", "articles"), {
    recursive: true,
  });
}

function writeEndpointDraft(root) {
  writeYaml(path.join(root, "content", ".drafts", "api", "endpoints", "admin-test-endpoint.yaml"), {
    slug: "admin-test-endpoint",
    title: "Admin test endpoint",
    description: "Created in the admin workflow test.",
    method: "GET",
    path: "/api/admin-test",
    status: "draft",
    headerParameters: [],
    pathParameters: [],
    queryParameters: [],
    requestBodyParameters: [],
    responses: [
      {
        status: "200",
        description: "Successful response.",
        parameters: [
          {
            name: "ok",
            type: "boolean",
            description: "Whether the request succeeded.",
          },
        ],
      },
    ],
    blocks: [],
    requestExamples: [
      {
        label: "cURL",
        language: "bash",
        code: "curl https://api.example.test/api/admin-test",
      },
    ],
    responseExamples: [
      {
        label: "200",
        language: "json",
        code: '{\n  "ok": true\n}',
      },
    ],
  });
}

function writeArticleDraft(root) {
  writeYaml(path.join(root, "content", ".drafts", "articles", "pages", "admin-test-article.yaml"), {
    slug: "admin-test-article",
    title: "Admin test article",
    description: "Created in the admin workflow test.",
    content: "# Admin test article\n\nThis article should publish from the draft tree.",
    blocks: [
      {
        type: "info",
        title: "Draft block",
        content: "Blocks are editable through YAML arrays.",
      },
    ],
  });
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "api-docs-admin-workflow-"));

try {
  fs.cpSync(path.join(projectRoot, "content"), path.join(tempRoot, "content"), { recursive: true });

  if (fs.existsSync(path.join(projectRoot, "public"))) {
    fs.cpSync(path.join(projectRoot, "public"), path.join(tempRoot, "public"), { recursive: true });
  }

  initializeDrafts(tempRoot);
  runValidation(tempRoot, "published base content validates");

  writeEndpointDraft(tempRoot);
  addNavigationItem(path.join(tempRoot, "content", ".drafts", "api", "navigation.yaml"), "system", {
    title: "Admin test endpoint",
    slug: "admin-test-endpoint",
  });

  if (fs.existsSync(path.join(tempRoot, "content", "api", "endpoints", "admin-test-endpoint.yaml"))) {
    throw new Error("Draft endpoint leaked into published content before publish.");
  }

  validateDraft(tempRoot, "new endpoint draft validates while unpublished");
  publishDrafts(tempRoot);

  if (!fs.existsSync(path.join(tempRoot, "content", "api", "endpoints", "admin-test-endpoint.yaml"))) {
    throw new Error("Published endpoint file was not created.");
  }

  runValidation(tempRoot, "published content validates after endpoint publish");

  writeArticleDraft(tempRoot);
  addNavigationItem(path.join(tempRoot, "content", ".drafts", "articles", "navigation.yaml"), "getting-started", {
    title: "Admin test article",
    slug: "admin-test-article",
  });

  if (fs.existsSync(path.join(tempRoot, "content", "articles", "pages", "admin-test-article.yaml"))) {
    throw new Error("Draft article leaked into published content before publish.");
  }

  validateDraft(tempRoot, "new article draft validates while unpublished");
  publishDrafts(tempRoot);

  if (!fs.existsSync(path.join(tempRoot, "content", "articles", "pages", "admin-test-article.yaml"))) {
    throw new Error("Published article file was not created.");
  }

  runValidation(tempRoot, "published content validates after article publish");

  fs.rmSync(path.join(tempRoot, "content", ".drafts", "api", "endpoints", "admin-test-endpoint.yaml"));
  removeNavigationItem(path.join(tempRoot, "content", ".drafts", "api", "navigation.yaml"), "admin-test-endpoint");
  publishDrafts(tempRoot);

  if (fs.existsSync(path.join(tempRoot, "content", "api", "endpoints", "admin-test-endpoint.yaml"))) {
    throw new Error("Deleted endpoint remained in published content after publish.");
  }

  runValidation(tempRoot, "published content validates after endpoint deletion publish");

  fs.rmSync(path.join(tempRoot, "content", ".drafts", "articles", "pages", "admin-test-article.yaml"));
  removeNavigationItem(path.join(tempRoot, "content", ".drafts", "articles", "navigation.yaml"), "admin-test-article");
  publishDrafts(tempRoot);

  if (fs.existsSync(path.join(tempRoot, "content", "articles", "pages", "admin-test-article.yaml"))) {
    throw new Error("Deleted article remained in published content after publish.");
  }

  runValidation(tempRoot, "published content validates after article deletion publish");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
