A labelled text field — `<TNInput>`. Focus shows a soft red ring; `error`/`warn`/`hint` render a message below.

```jsx
<Input label="Название документа" placeholder="Введите название" />
<Input icon="mail" placeholder="email@tn.ru" error="Неверный формат" />
```

Props: `label`, `size` (sm/md/lg/xl), `icon`, `iconRight`, `error`, `warn`, `hint`, `disabled`. Forwards native input props.
