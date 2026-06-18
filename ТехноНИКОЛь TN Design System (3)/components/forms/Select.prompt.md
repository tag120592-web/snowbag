A single-select dropdown — `<TNSelector>`. Options are `{id, title}` (or `{value, label}`, or plain strings).

```jsx
<Select label="Тип документа" placeholder="Выберите" options={[
  { id: "gost", title: "ГОСТ" },
  { id: "sp", title: "Свод правил (СП)" },
]} onChange={(id) => setType(id)} />
```

Props: `label`, `value`, `options`, `size`, `error`, `disabled`, `onChange`. Closes on outside click; selected row gets a red check.
