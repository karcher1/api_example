# Как добавить эти документы в проект

Этот архив содержит готовый набор документов для Codex и примеры YAML/content-файлов для платформы документации.

## Что внутри

```txt
AGENTS.md
README_ADD_TO_PROJECT.md

docs/
  API_DOCS_PLATFORM_SPEC.md
  API_DOCS_YAML_SCHEMA.md
  CODEX_IMPLEMENTATION_PROMPT.md
  CODEX_TASK_CHECKLIST.md
  CONTENT_MANAGEMENT_GUIDE.md

content/
  api/
    navigation.yaml
    endpoints/
      create-user.yaml
      get-user.yaml
  articles/
    navigation.yaml
    pages/
      introduction.yaml
      authentication.yaml
```

## Как использовать

1. Распакуйте архив.
2. Скопируйте `AGENTS.md` в корень вашего репозитория.
3. Скопируйте папку `docs/` в корень вашего репозитория.
4. Папку `content/` можно:
   - скопировать в проект как стартовую структуру, если такой структуры ещё нет;
   - использовать только как пример, если у вас уже есть своя структура YAML/content-файлов.
5. Откройте `docs/CODEX_IMPLEMENTATION_PROMPT.md` и дайте этот текст Codex как задачу.

## Важное правило

Существующий layout/design уже считается утверждённым. Codex должен реализовывать функциональность вокруг текущего layout, а не перепридумывать внешний вид сайта.

## Рекомендуемый порядок работы с Codex

1. Сначала попросить Codex изучить проект и документы.
2. Затем попросить составить короткий implementation plan.
3. После этого разрешить ему вносить изменения.
4. В конце попросить проверить acceptance criteria из `docs/CODEX_TASK_CHECKLIST.md`.

## Главная идея проекта

Сайт должен стать file-driven documentation platform:

- API Reference создаётся из YAML/content-файлов;
- статьи создаются из YAML/content-файлов;
- навигация создаётся из YAML/content-файлов;
- добавление endpoint или статьи не требует изменения application code;
- request/response examples, параметры, блоки note/warning/info и форматированный текст задаются в контенте;
- layout остаётся прежним.
