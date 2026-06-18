# ТехноНИКОЛь — TN Design System

Design system for **ТехноНИКОЛь's internal corporate AI platform (superapp)** — a ~10 000-employee
"super-app" for the construction-materials manufacturer. This system recreates the company's
**TN Life UI Kit** (`@life_uikit/uikit`, Vue 3) in React so design agents can produce on-brand
screens, prototypes and assets. It was built to design the new **«Аудитор»** (Auditor) section
inside the **«База знаний»** (Knowledge Base) agent — a mode, next to the existing **«Ассистент»**
(Q&A), that audits the knowledge base itself for **дубли** (duplicates), **противоречия**
(contradictions), **битые ссылки** (broken links) and **статьи без активного владельца**
(ownerless articles). It flags; a human decides ("Подсвечивает — решает человек").

- **Platform:** internal superapp, light theme only.
- **Accent:** TN red `#e11b11` (`--red-60`).
- **Type:** Proxima Nova (weights 300–800).
- **Language:** Russian UI copy throughout.

## Sources

These were provided as the source of truth and live under `uploads/` (kept as reference; not
shipped to consumers):

- **`@life_uikit/uikit` v6.6.2** — the real Vue 3 component library. Repo (private):
  `https://gitlab.tn.ru/superapp/superapp/tn-uikit/uikit`
- `uploads/variables.css` — the full token palette (mirrored 1:1 into `tokens/colors.css`).
- `uploads/fonts.css` — Proxima Nova `@font-face` declarations (the TTFs themselves were **not**
  included — see Substitutions).
- `uploads/index.js` / `index.d.ts` / `interfaces.ts` — the component registry (`TNButton`,
  `TNInput`, `TNTabs`, `TNCell`, `TNUserPicture`, `TNTag`, …) and their prop contracts.
- `uploads/README.md`, `Changelog.md`, `CONTRIBUTING.md` — usage and history.

> The real kit is consumed in Vue as `app.use(TNLifeUIKit)` then `<TNButton size="sm">…`. This
> design system re-expresses the same primitives as React components for prototyping.

## Substitutions (please confirm / replace)

1. **Font — Proxima Nova → Manrope.** The Proxima Nova TTFs ship privately and were not in the
   upload. `tokens/fonts.css` loads **Manrope** (Google Fonts, full Cyrillic, closest geometric-
   humanist analog) and aliases the family name `"Proxima Nova"` to it. Drop the real TTFs into
   `assets/fonts/` and point the `@font-face` `src` at them to restore the exact brand face.
2. **Icons — TN SVG sprite → Lucide.** The kit's `TNIcon` reads a private SVG sprite keyed by
   `IconNames`. We substitute **Lucide** (stroke 2, 24px grid) via CDN, tinted with CSS mask so
   glyphs inherit `currentColor`. If you can export the real sprite, drop it in and update
   `components/core/Icon.jsx`.
3. **Logo.** No ТехноНИКОЛь logo asset was provided. The superapp rail uses a temporary **"TN"**
   monogram in a red square. Please supply the official logo SVG.

---

## Content fundamentals

How TN writes UI copy (observed in the kit, the changelog, and standard RU enterprise tone):

- **Language:** Russian. Sentence case — capitalize the first word only; **no Title Case**, no
  ALL-CAPS except tiny eyebrow labels. ("Новый аудит", "Скачать отчёт", "Недавние аудиты".)
- **Address:** impersonal / instructional, not "you"/"я". Buttons are imperative verbs
  ("Применить", "Создать", "Игнорировать", "Скачать отчёт"). System messages are neutral and
  declarative ("Проверка завершена", "Документ загружен").
- **Tone:** precise, technical, calm. This is an engineering tool for a manufacturer — copy reads
  like a regulation, not marketing. Reference real norm identifiers (ГОСТ 30547-97, СП
  17.13330.2017, ТУ …, "п. 5.1.3") — specificity is the brand.
- **Numbers & units:** metric, with a space before the unit and a comma decimal ("250–350 г/м²",
  "не менее 1,5%", "минус 25 °C"). Ranges use an en-dash.
- **Terminology:** "проверка", "проблема", "замечание", "источник", "владелец", "затронутые
  страницы", "основание". Problem types: **Противоречие / Дубль / Битая ссылка / Нет владельца**.
  Severity ladder maps to the semantic palette (no new colors): **Критическая (red/danger) →
  Высокая (orange/warning) → Средняя (yellow) → Низкая (neutral)**.
- **No emoji.** None in the product. Status is carried by color + icon + a `Tag`, never an emoji.
- **Punctuation:** Russian quotation guillemets «…» for quoted document text; middot ` · ` as a
  metadata separator ("Кровля-2024.docx · Сегодня, 14:32 · 14 источников").

---

## Visual foundations

- **Light theme, white surfaces.** App background is `--neutral-10` (`#f9f9fa`); panels/cards are
  pure white with a **1px hairline border** (`--border-secondary-enabled`, `#d7dae1`) and a
  **12px** radius (`--radius-lg`). A dark theme exists in the kit but this system ships light.
- **Color is restrained.** Neutrals do ~90% of the work; **red is the single accent** used
  sparingly — primary actions, active nav, critical findings, brand mark. The default solid
  button is actually **dark** (`--neutral-100`), not red; red (`accent`) is reserved for the one
  most important action on a screen. Status uses green/orange/blue/red at low tints (`-10`) with a
  dark-tint (`-65`) label.
- **Corners:** controls & inputs **8px** (`--radius-md`), cards **12px**, sheets/modals **16px**
  (`--radius-xl`), tags **6px**, avatars/switches/search **pill**. Generous but not playful.
- **Spacing:** strict **4px grid**. Common rhythm 8 / 12 / 16 / 24. Comfortable, not dense.
- **Elevation:** only two shadows. `--shadow-small` (a soft, slightly-offset card/menu shadow:
  `-4px 6px 7px`) and `--shadow-large` for modals. Most surfaces use **border, not shadow**.
- **Type:** one family (Proxima Nova). Headlines are **Extrabold 800**, titles Bold 700, controls
  & emphasis Semibold 600, body Regular 400. UI body is **14px/20**; never below 12px.
- **Borders over fills.** Inputs, cards, dashed upload zones — definition comes from 1px borders.
  Focus shows a soft red ring (`--focus-ring`, `rgba(225,27,17,.18)`).
- **Motion:** quick and linear. The kit's signature transition is `opacity .2s linear` (`tn-fade`);
  controls animate background/border over ~.15s. No bounce, no large slides. Spinners use
  `loader-circle` rotating ~0.7s.
- **States:** hover = one step darker surface (`-hover` tokens) or `--neutral-10` tint on ghost
  items; pressed = the `-pressed` token (a further step). Disabled = 50% opacity / muted neutral.
- **Imagery:** the product is data-and-document-centric — there is almost no photography in-app.
  Documents render on white "paper" cards. Findings are shown inline with a tinted left-accent
  bar (red/orange) over the paragraph, plus a severity `Tag`.
- **No gradients, no blur-glass, no decorative illustration** in the working UI (the kit does have
  an illustration set for empty/marketing states — see Iconography). Keep it flat and crisp.

---

## Iconography

- **System:** the real kit uses **`TNIcon`** backed by a private **SVG sprite** (`addSVGSpriteToBody()`),
  keyed by a generated `IconNames` union (extendable per-project via `package.json` →
  `tn-ui-kit.external-icon-names`). Icons are single-color line glyphs that inherit text color.
- **Substitute here:** **Lucide** (`lucide-static` via jsDelivr CDN), stroke-2, 24px grid — a very
  close visual match to TN's line icons. `components/core/Icon.jsx` renders them as a CSS-`mask`
  span so `color` / `currentColor` tints them, exactly like the original. Pass any Lucide name.
  - Common names in use: `shield-check`, `file-text`, `book-open`, `circle-alert`,
    `triangle-alert`, `check`, `search`, `upload`, `download`, `sparkles`, `book-marked`,
    `map-pin`, `gauge`, `chevron-right`.
  - ⚠️ Lucide renamed some icons — use the **canonical** names (`triangle-alert`, `circle-alert`),
    not the old `alert-*` aliases.
- **Illustrations:** the kit exposes `TNIllustration` (a named illustration set) for empty states.
  Those assets were not in the upload; `EmptyContent` uses a circled Lucide glyph instead. Supply
  the illustration SVGs to restore them.
- **Emoji / unicode:** not used as iconography anywhere.

---

## Index / manifest

**Root**
- `styles.css` — global entry (import this one file). `@import`s the four token files.
- `tokens/colors.css` · `tokens/typography.css` · `tokens/spacing.css` · `tokens/fonts.css`
- `readme.md` (this file) · `SKILL.md` (Agent-Skill front-matter)
- `uploads/` — original TN UI-kit source, kept for reference.

**Components** (`components/<group>/<Name>.{jsx,d.ts,prompt.md}` + one card per group) — exposed on
`window.TNDesignSystem_7f9df2`:
- `core/` — **Icon**
- `actions/` — **Button**
- `forms/` — **Input, Textarea, Search, Select, Checkbox, Radio, Switch**
- `data-display/` — **Tag, Badge, Avatar, Card, Cell**
- `feedback/` — **ProgressBar, EmptyContent, Tooltip, Dialog**
- `navigation/` — **Tabs, Breadcrumbs**

**Foundation cards** (`guidelines/*.card.html`) — Colors, Type, Spacing specimens for the Design
System tab.

**UI kit** (`ui_kits/auditor/`) — the **«Аудитор»** mode of the superapp's «База знаний» agent.
Built entirely from the kit's components. Superapp rail + agent panel (nested **Ассистент /
Аудитор** mode switch) + topbar, and the views: an agent **landing** (centered hero → big
composer → suggestion rows, the platform's shared agent pattern), a **scanning** state, a
**report** (query echo, summary chips `2 противоречия · 2 дубля · …`, severity-sorted problem
cards with per-type evidence — two-column contradictions, similarity-scored duplicates, dead-link
trace, ownerless owner+last-login), a **share** dialog (protected link), and an admin **dashboard**
(health index, type counters, department hotspots, inactive-owners table, severity weights). Each
flag shows its **Основание** (basis). Entry: `ui_kits/auditor/index.html`.
