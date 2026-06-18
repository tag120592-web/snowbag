A list row with leading/trailing slots — `<TNCell>`. The building block for lists, menus and file rows.

```jsx
<Cell leftSlot={<Avatar text="ИП" />} title="Иван Петров" subtitle="Инженер ПТО" rightIcon="chevron-right" onClick={fn} />
<Cell leftIcon="file-text" title="СП 17.13330.2017" rightText="2.4 МБ" />
```

Props: `title`, `subtitle`, `leftIcon`/`leftSlot`, `rightText`/`rightIcon`/`rightSlot`, `accent`, `selected`, `disabled`, `onClick`.
