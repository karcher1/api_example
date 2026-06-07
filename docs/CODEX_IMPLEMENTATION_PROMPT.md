# Prompt for Codex

Скопируйте этот текст и дайте его Codex как задачу.

---

Изучи текущий проект и реализуй функциональную платформу документации согласно файлам:

- `docs/API_DOCS_PLATFORM_SPEC.md`
- `docs/API_DOCS_YAML_SCHEMA.md`
- `docs/CODEX_TASK_CHECKLIST.md`
- `docs/CONTENT_MANAGEMENT_GUIDE.md`

Важно:

- существующий layout/design не менять;
- не переписывать проект с нуля;
- использовать текущие компоненты и структуру, если они уже подходят;
- не менять визуальные пропорции, типографику и общий layout без необходимости;
- убрать или минимизировать hardcode там, где контент должен приходить из YAML/content files;
- API Reference и Guides должны быть двумя независимыми секциями с отдельной навигацией;
- добавление endpoint или guide должно происходить через YAML/content file, без изменения application code.

Сначала сделай следующее:

1. Найди текущую структуру проекта.
2. Определи, как сейчас устроены страницы, layout, routing, YAML/content loading.
3. Определи, какие компоненты уже есть и какие можно переиспользовать.
4. Составь короткий implementation plan.
5. Затем внеси изменения.

Нужно реализовать:

## 1. API Reference navigation из YAML

- группы/секции;
- ручной порядок;
- endpoints внутри секций;
- возможность переносить endpoint между секциями через YAML;
- возможность добавлять/удалять/переименовывать секции через YAML;
- все секции раскрыты по умолчанию при первом входе;
- раскрытое/свернутое состояние сохраняется при переходах;
- активная страница подсвечивается;
- навигация не схлопывается автоматически при переходе между endpoint pages.

## 2. API endpoint pages из YAML

Endpoint page должна рендерить:

- title;
- description;
- method;
- path;
- status;
- header parameters;
- path parameters;
- query parameters;
- request body parameters;
- responses by status;
- custom blocks: note/info/warning/danger/tip;
- formatted text / markdown;
- request examples with custom selector;
- response examples with custom selector.

## 3. Parameters

Header/path/query/request body parameters имеют поля:

- name;
- type;
- required;
- description.

Path/request body parameters also support optional `standard`, which should render separately from `description`.

Response parameters имеют поля:

- name;
- type;
- description.

Response parameters grouped by status.

## 4. Request examples

- selector options are custom per endpoint;
- no fixed language list;
- each option has label, language, code;
- selected option displays corresponding code;
- examples are defined in endpoint YAML.

## 5. Response examples

- same behavior as request examples;
- custom labels per endpoint;
- each option has label, language, code;
- examples are defined in endpoint YAML.

## 6. Guides section

- separate navigation from YAML;
- guide pages from content files;
- support headings, text, bold, italic, hyperlinks, inline code, code blocks, images;
- guide navigation active state;
- easy add/edit/delete/reorder through content files.

## 7. Validation

Add validation where practical:

- detect duplicate endpoint slugs;
- detect duplicate guide slugs;
- detect navigation links to missing files;
- detect missing required fields;
- avoid rendering empty broken sections;
- make development/build errors understandable.

## Acceptance criteria

The implementation is complete only when:

- I can add a new endpoint by adding one YAML file and linking it in API navigation YAML.
- I can move an endpoint to another nav section by editing navigation YAML only.
- I can add a new guide by adding one content file and linking it in guide navigation YAML.
- Existing layout remains visually unchanged.
- No hardcoded endpoint/guide/example lists remain where YAML should be source of truth.
- API Reference and Guides have independent navigation.
- Request examples selector works per endpoint.
- Response examples selector works per endpoint.
- Active navigation item works on direct URL, refresh, and browser navigation.
- Build/dev server runs successfully.
- Existing tests pass, or new tests/validation are added if the project has testing infrastructure.

## Non-goals

Do not implement unless explicitly requested:

- admin panel;
- database;
- authentication;
- OpenAPI import;
- automatic SDK generation;
- redesign;
- framework migration.

Before final answer, summarize:

1. What files were changed.
2. How content should now be added.
3. How to add a new endpoint.
4. How to add a new guide.
5. Which acceptance criteria are satisfied.
6. Which items, if any, are left for follow-up.
