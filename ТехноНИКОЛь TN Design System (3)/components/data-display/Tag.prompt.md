A status chip / label — `<TNTag>`. Soft tint by default; `solid` for filled.

```jsx
<Tag tone="red" icon="alert-triangle">Критично</Tag>
<Tag tone="green">Соответствует</Tag>
<Tag removable onRemove={fn}>ГОСТ 30547</Tag>
```

Tones: neutral, red, green, blue, orange, yellow, purple. Props: `size` (sm/md), `icon`, `solid`, `removable`/`onRemove`.
