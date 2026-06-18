---
name: technonikol-design
description: Use this skill to generate well-branded interfaces and assets for ТехноНИКОЛь's internal AI superapp (TN Life UI Kit), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create
static HTML files for the user to view. If working on production code, you can copy assets and read
the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or
design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_
production code, depending on the need.

## Quick facts
- **Brand:** ТехноНИКОЛь internal superapp · light theme · accent red `#e11b11`.
- **Type:** Proxima Nova 300–800 (this kit substitutes **Manrope** until the TTFs are supplied).
- **Icons:** Lucide (substitute for the private TN SVG sprite) — use canonical names.
- **Tokens:** link `styles.css` (one file) for all colors / type / spacing custom properties.
- **Components:** React, on `window.TNDesignSystem_7f9df2` after loading `_ds_bundle.js`. See each
  component's `.prompt.md` for usage.
- **Reference UI:** `ui_kits/auditor/` — the «Аудитор» section of the «База знаний» agent.

## Copy rules (Russian)
Sentence case, imperative buttons, impersonal tone, metric units with comma decimals, real norm
IDs (ГОСТ/СП/ТУ), no emoji. Severity ladder: Критично → Предупреждение → Решено.
