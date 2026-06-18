A pill-shaped search field with a clear button — `<TNSearch>`.

```jsx
<Search placeholder="Поиск по документам" onChange={e => setQ(e.target.value)} />
```

Props: `size` (sm/md/lg), `placeholder`, `onClear`. Gray fill, rounded; the ✕ appears once there's text.
