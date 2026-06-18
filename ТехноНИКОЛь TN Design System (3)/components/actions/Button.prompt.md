The primary call-to-action — `<TNButton>`. `primary` is the dark default; `accent` is brand red; use it sparingly for the single most important action.

```jsx
<Button variant="accent" icon="plus">Создать аудит</Button>
<Button variant="secondary" size="sm">Отмена</Button>
<Button variant="outline" iconRight="chevron-down">Фильтры</Button>
<Button variant="link" icon="download">Скачать</Button>
<Button icon="settings" aria-label="Настройки" />
```

Variants: `primary` (dark), `accent` (red), `secondary` (gray), `white` (bordered light), `outline`, `link`. Sizes `sm|md|lg|xl`. Supports `icon`/`iconRight`, `block`, `rounded`, `loading`, `disabled`.
