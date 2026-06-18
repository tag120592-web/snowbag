A tab strip — `<TNTabs>`. `underline` (default) or `segmented` (pill group). Active tab uses a red underline / white pill.

```jsx
<Tabs options={[
  { id: "all", name: "Все", secondaryText: 24 },
  { id: "crit", name: "Критичные", icon: "alert-triangle", secondaryText: 3 },
]} onChange={setTab} />
```

Props: `options` ({id, name, secondaryText?, icon?, disabled?}), `value`, `variant`, `size`, `onChange`.
