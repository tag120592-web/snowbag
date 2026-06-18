A breadcrumb trail — `<TNBreadcrumbs>`. Last item is the current page (bold, non-clickable).

```jsx
<Breadcrumbs items={[
  { text: "База знаний" },
  { text: "Аудитор" },
  { text: "Кровля-2024" },
]} onNavigate={(it, i) => go(i)} />
```

Props: `items` ({text, to?, href?}), `onNavigate`.
