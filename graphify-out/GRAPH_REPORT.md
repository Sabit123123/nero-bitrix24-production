# Graph Report - nero-bitrix24-production  (2026-06-18)

## Corpus Check
- 24 files · ~114,384 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 270 nodes · 365 edges · 22 communities (18 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4afa5589`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `AquaUzel — админка товаров` - 15 edges
2. `UI/UX Pro Max - Design Intelligence` - 13 edges
3. `Тексты для Google Business Profile — AquaUzel` - 13 edges
4. `DesignSystemGenerator` - 11 edges
5. `Quick Reference` - 11 edges
6. `Перенос AquaUzel на VPS (ps.kz)` - 10 edges
7. `esc()` - 9 edges
8. `_search_csv()` - 8 edges
9. `start()` - 8 edges
10. `buildGroup()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `_generate_intelligent_overrides()` --calls--> `search()`  [INFERRED]
  .claude/skills/ui-ux-pro-max/scripts/design_system.py → .claude/skills/ui-ux-pro-max/scripts/core.py

## Import Cycles
- None detected.

## Communities (22 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (38): Accessibility, Available Domains, Available Stacks, Common Rules for Professional UI, Common Sticking Points, Example Workflow, How to Use, How to Use This Skill (+30 more)

### Community 1 - "Community 1"
Cohesion: 0.19
Nodes (24): absUrl(), boot(), buildGroup(), buildPriceHTML(), downloadPricePDF(), el(), esc(), fmtPrice() (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (22): ansi_ljust(), _detect_page_type(), format_ascii_box(), format_markdown(), format_master_md(), format_page_override_md(), generate_design_system(), _generate_intelligent_overrides() (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.21
Nodes (21): addBlank(), applyView(), buildCard(), buildListHead(), defaultView(), enterApp(), esc(), fillCats() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (15): BM25, detect_domain(), _load_csv(), BM25 ranking algorithm for text search, Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (9): DesignSystemGenerator, Select best matching result based on priority keywords., Extract results list from search result dict., Generate complete design system recommendation., Generates design system recommendations from aggregated searches., Load reasoning rules from CSV., Execute searches across multiple domains., Find matching reasoning rule for a category. (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (15): AquaUzel — админка товаров, Вход и пароль, Деплой, Добавить товар, Добавить фото (с телефона/компьютера), Запуск локально, Как открыть админку, Как формируется прайс (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (14): 10. Короткое имя профиля (ссылка g.page), 11. Фотографии (что загрузить), 12. Ключевые слова (вплетайте в посты, ответы, описания товаров), 1. Название компании, 2. Категории, 3. Адрес и контакты, 4. Описание компании (до 750 символов), 5. Способы обслуживания и атрибуты (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (5): compress(), iconFor(), slug(), toPriceData(), uploadImage()

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (13): blend(), derive_row(), derive_ui_reasoning(), h2r(), is_dark(), lum(), on_color(), r2h() (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (10): 1. Создать VPS на ps.kz, 2. Базовая настройка сервера, 3. Залить сайт на сервер, 4. Настроить nginx, 5. Домен и DNS, 6. Включить HTTPS (Let's Encrypt), 7. Обновление сайта дальше, Если нужны www→без-www и т.п. (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (11): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.25
Nodes (7): AquaUzel — сайт-визитка, Возможности, Как обновить прайс, Контакты (зашиты в `index.html`), Логотип, Локальный просмотр, Структура

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (6): 1. Включить GitHub Pages, 2. Настроить DNS у регистратора домена aquauzel.kz, 3. Указать домен в GitHub, Карта, Прайс в PDF, Публикация AquaUzel и привязка домена aquauzel.kz

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (6): 1. Превью для ссылок (соцсети) — обязательно, 2. Секция «Применение» — 4 фото (вертикальные 4:5, ~1000×1250), 3. (Опционально) Главный продукт для hero — с прозрачным фоном, Как добавить файлы, Про логотип, Промты для генерации изображений (GPT / DALL·E / Midjourney)

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (6): Админка AquaUzel на Supabase — настройка (один раз), Шаг 1. Создать проект Supabase, Шаг 2. Создать таблицу, политики и хранилище, Шаг 3. Перенести текущие 572 товара (миграция), Шаг 4. Создать администратора (вход на сайте — только по паролю), Шаг 5. Подключить сайт к проекту

## Knowledge Gaps
- **99 isolated node(s):** `deploy.sh script`, `Must Use`, `Recommended`, `Skip`, `Rule Categories by Priority` (+94 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UI/UX Pro Max - Design Intelligence` connect `Community 0` to `Community 11`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `search()` connect `Community 4` to `Community 2`, `Community 5`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `DesignSystemGenerator` connect `Community 5` to `Community 2`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `Generate full 16-token color row from 4 base colors.`, `Generate ui-reasoning row from products.csv row.`, `BM25 ranking algorithm for text search` to the rest of the system?**
  _130 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12648221343873517 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.14736842105263157 - nodes in this community are weakly interconnected._