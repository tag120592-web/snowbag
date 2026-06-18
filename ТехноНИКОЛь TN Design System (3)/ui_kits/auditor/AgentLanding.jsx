// Аудитор UI kit — лендинг агента: приветствие + композер + список вопросов.
// Воспроизводит экран «ИИ-ассистент» один-в-один; переиспользуется Аудитором.
const { Icon } = window.TNDesignSystem_7f9df2;

function Composer({ value, onChange, onSubmit, placeholder }) {
  const [focus, setFocus] = React.useState(false);
  const has = value.trim().length > 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        flex: 1, display: "flex", alignItems: "center", gap: 10, height: 60, padding: "0 16px",
        background: "#fff",
        border: `1px solid ${focus ? "var(--border-primary-a-enabled)" : "var(--border-secondary-enabled)"}`,
        borderRadius: "var(--radius-xl)",
        boxShadow: focus ? "var(--shadow-small)" : "none",
        transition: "border-color .15s, box-shadow .15s",
      }}>
        <Icon name="plus" size={22} color="var(--content-secondary-enabled)" />
        <input
          value={value}
          placeholder={placeholder}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSubmit(); } }}
          style={{
            flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent",
            fontFamily: "var(--font-family-base)", fontSize: 16, color: "var(--content-primary-a-enabled)",
          }}
        />
        <Icon name="mic" size={22} color="var(--content-secondary-enabled)" />
      </div>
      <button type="button" title="Отправить" onClick={onSubmit} disabled={!has} style={{
        width: 48, height: 48, flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center",
        border: "none", borderRadius: "var(--radius-lg)", cursor: has ? "pointer" : "default",
        background: has ? "var(--background-accent-enabled)" : "var(--background-secondary-a-enabled)",
        transition: "background .15s",
      }}>
        <Icon name="arrow-right" size={22} color={has ? "#fff" : "var(--content-tertiary-enabled)"} />
      </button>
    </div>
  );
}

function SuggestionRow({ item, onClick, last }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button type="button" onClick={() => onClick(item)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "16px 8px",
        border: "none", borderBottom: last ? "none" : "1px solid var(--border-secondary-enabled)",
        cursor: "pointer", textAlign: "left",
        background: hover ? "var(--background-primary-a-hover)" : "transparent",
        transition: "background .12s",
      }}>
      <span style={{ flex: 1, fontSize: 15, color: "var(--content-primary-a-enabled)" }}>{item.text}</span>
      <Icon name="arrow-right" size={20} color={hover ? "var(--content-accent-enabled)" : "var(--content-tertiary-enabled)"} />
    </button>
  );
}

function AgentLanding({ config, onSubmit }) {
  const [text, setText] = React.useState("");
  const submit = (val) => { const q = (val ?? text).trim(); if (q) onSubmit(q); };
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "64px 40px 48px" }}>
        {/* Приветствие */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>{config.heading}</div>

        {/* Композер */}
        <Composer value={text} onChange={setText} onSubmit={() => submit()} placeholder={config.placeholder} />

        {/* Вопросы */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--content-primary-a-enabled)", padding: "0 8px 2px" }}>{config.suggestLabel}</div>
          <div>
            {config.suggestions.map((s, i) => (
              <SuggestionRow key={s.id} item={s} last={i === config.suggestions.length - 1} onClick={(it) => submit(it.text)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AgentLanding });
