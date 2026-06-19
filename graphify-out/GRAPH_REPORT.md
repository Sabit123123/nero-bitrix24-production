# Graph Report - nero-bitrix24-production  (2026-06-19)

## Corpus Check
- 29 files · ~125,780 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 449 nodes · 758 edges · 34 communities (29 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c41bf817`
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
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]

## God Nodes (most connected - your core abstractions)
1. `_()` - 68 edges
2. `Se` - 54 edges
3. `_()` - 27 edges
4. `r()` - 23 edges
5. `fa` - 22 edges
6. `AquaUzel — админка товаров` - 15 edges
7. `UI/UX Pro Max - Design Intelligence` - 13 edges
8. `Тексты для Google Business Profile — AquaUzel` - 13 edges
9. `DesignSystemGenerator` - 11 edges
10. `Oa()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `_generate_intelligent_overrides()` --calls--> `search()`  [INFERRED]
  .claude/skills/ui-ux-pro-max/scripts/design_system.py → .claude/skills/ui-ux-pro-max/scripts/core.py
- `Oa()` --calls--> `s()`  [INFERRED]
  aquauzel-site/assets/js/vendor/jspdf.umd.min.js → aquauzel-site/assets/js/vendor/jspdf.plugin.autotable.min.js
- `Oa()` --calls--> `f()`  [INFERRED]
  aquauzel-site/assets/js/vendor/jspdf.umd.min.js → aquauzel-site/assets/js/vendor/jspdf.plugin.autotable.min.js
- `r()` --calls--> `f()`  [INFERRED]
  aquauzel-site/assets/js/vendor/jspdf.umd.min.js → aquauzel-site/assets/js/vendor/jspdf.plugin.autotable.min.js
- `Oa()` --calls--> `z()`  [INFERRED]
  aquauzel-site/assets/js/vendor/jspdf.umd.min.js → aquauzel-site/assets/js/vendor/jspdf.plugin.autotable.min.js

## Import Cycles
- None detected.

## Communities (34 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (8): Available Domains, Available Stacks, How to Use, Output Formats, Prerequisites, Rule Categories by Priority, Search Reference, UI/UX Pro Max - Design Intelligence

### Community 1 - "Community 1"
Cohesion: 0.19
Nodes (26): absUrl(), boot(), buildGroup(), buildPriceHTML(), downloadPricePDF(), el(), esc(), fmtPrice() (+18 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (31): ansi_ljust(), DesignSystemGenerator, _detect_page_type(), format_ascii_box(), format_markdown(), format_master_md(), format_page_override_md(), generate_design_system() (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.21
Nodes (21): addBlank(), applyView(), buildCard(), buildListHead(), defaultView(), enterApp(), esc(), fillCats() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (15): BM25, detect_domain(), _load_csv(), BM25 ranking algorithm for text search, Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (44): _(), a(), aa(), b(), C(), Ca(), d(), e() (+36 more)

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

### Community 22 - "Community 22"
Cohesion: 0.40
Nodes (4): Быстро: включить только полный авто (Codex сделает всё сам), Заметки (для тебя, не для вставки), Полная настройка (Graphify + авто‑режим + авто‑сохранение), Промт для Codex — настроить себя так же (Graphify + автономный режим + авто‑сохранение)

### Community 24 - "Community 24"
Cohesion: 0.11
Nodes (8): ea(), fa, ha(), ka(), Pa(), ua(), Vi(), xe()

### Community 25 - "Community 25"
Cohesion: 0.20
Nodes (26): _(), A(), b(), c(), d(), e(), f(), g() (+18 more)

### Community 26 - "Community 26"
Cohesion: 0.46
Nodes (7): absUrl(), download(), ensureLibs(), imgToDataURL(), isPriceCol(), loadScript(), priceText()

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (6): Accessibility, Interaction, Layout, Light/Dark Mode, Pre-Delivery Checklist, Visual Quality

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (6): How to Use This Skill, Step 1: Analyze User Requirements, Step 2: Generate Design System (REQUIRED), Step 2b: Persist Design System (Master + Overrides Pattern), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines (React Native)

### Community 29 - "Community 29"
Cohesion: 0.40
Nodes (5): Common Rules for Professional UI, Icons & Visual Elements, Interaction (App), Layout & Spacing, Light/Dark Mode Contrast

### Community 30 - "Community 30"
Cohesion: 0.40
Nodes (5): Example Workflow, Step 1: Analyze Requirements, Step 2: Generate Design System (REQUIRED), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines

### Community 31 - "Community 31"
Cohesion: 0.50
Nodes (4): Common Sticking Points, Pre-Delivery Checklist, Query Strategy, Tips for Better Results

### Community 32 - "Community 32"
Cohesion: 0.50
Nodes (4): Must Use, Recommended, Skip, When to Apply

## Knowledge Gaps
- **102 isolated node(s):** `deploy.sh script`, `Must Use`, `Recommended`, `Skip`, `Rule Categories by Priority` (+97 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_()` connect `Community 5` to `Community 24`, `Community 23`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `Se` connect `Community 23` to `Community 24`, `Community 5`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `r()` connect `Community 5` to `Community 24`, `Community 25`, `Community 23`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `r()` (e.g. with `f()` and `q()`) actually correct?**
  _`r()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `fa` (e.g. with `ka()` and `Pa()`) actually correct?**
  _`fa` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Generate full 16-token color row from 4 base colors.`, `Generate ui-reasoning row from products.csv row.`, `BM25 ranking algorithm for text search` to the rest of the system?**
  _133 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07307692307692308 - nodes in this community are weakly interconnected._