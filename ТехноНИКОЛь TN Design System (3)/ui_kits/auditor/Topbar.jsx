// Аудитор UI kit — хедер карточки: «ИИ-ассистент» слева, «···» и «✕» справа.
const { Icon } = window.TNDesignSystem_7f9df2;

function HeaderBtn({ icon, title, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button type="button" title={title} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
        border: "none", borderRadius: "var(--radius-md)", cursor: "pointer",
        background: hover ? "var(--neutral-20)" : "var(--background-secondary-a-enabled)",
        transition: "background .12s",
      }}>
      <Icon name={icon} size={20} color="var(--neutral-55)" />
    </button>
  );
}

function Topbar({ title = "ИИ-ассистент" }) {
  return (
    <div style={{
      height: 72, flex: "0 0 72px", display: "flex", alignItems: "center", gap: 10,
      padding: "0 16px 0 24px", background: "#fff", borderBottom: "1px solid var(--neutral-15)",
    }}>
      <span style={{ fontFamily: "var(--font-family-base)", fontSize: 20, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>{title}</span>
      <div style={{ flex: 1 }} />
      <HeaderBtn icon="ellipsis" title="Ещё" />
      <HeaderBtn icon="x" title="Закрыть" />
    </div>
  );
}

Object.assign(window, { Topbar });
