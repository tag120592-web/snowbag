A centered modal over a dimmed backdrop — `<TNPopup>`. Closes on backdrop click or ✕.

```jsx
<Dialog title="Удалить аудит?" onClose={fn}
  footer={<><Button variant="secondary" onClick={fn}>Отмена</Button><Button variant="accent">Удалить</Button></>}>
  Действие необратимо.
</Dialog>
```

Props: `open`, `title`, `children`, `footer`, `width`, `onClose`.
