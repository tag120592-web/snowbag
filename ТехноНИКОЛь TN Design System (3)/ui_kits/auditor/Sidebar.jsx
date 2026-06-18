// Аудитор UI kit — узкий рейл супераппа + панель-дерево агента «ИИ-ассистент».
// Состав и подложки воспроизводят реальный экран один-в-один.
const { Icon, Avatar, Badge } = window.TNDesignSystem_7f9df2;

// ---------- Узкий рейл иконок ----------
function RailBtn({ icon, title, badge, dot, color, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button type="button" title={title} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
        border: "none", borderRadius: "var(--radius-lg)", cursor: "pointer",
        background: hover ? "var(--neutral-10)" : "transparent",
      }}>
      <Icon name={icon} size={24} color={color || "var(--neutral-55)"} />
      {badge != null && (
        <span style={{ position: "absolute", top: 2, right: 2 }}><Badge count={badge} max={9} /></span>
      )}
      {dot && <span style={{ position: "absolute", top: 9, right: 11, width: 7, height: 7, borderRadius: "999px", background: "var(--red-60)", border: "1.5px solid #fff" }} />}
    </button>
  );
}

function Rail() {
  const { CURRENT_USER } = window.AUDITOR_DATA;
  return (
    <div style={{
      width: 88, flex: "0 0 88px", display: "flex", flexDirection: "column", alignItems: "center",
      padding: "14px 0 12px", gap: 6, background: "transparent",
    }}>
      {/* Поиск — в сером скруглённом квадрате */}
      <button type="button" title="Поиск" style={{
        width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center",
        border: "none", background: "var(--background-secondary-a-enabled)", borderRadius: "var(--radius-xl)", cursor: "pointer", marginBottom: 12,
      }}>
        <Icon name="search" size={22} color="var(--neutral-60)" />
      </button>

      <RailBtn icon="layout-grid" title="Главная" />
      <RailBtn icon="messages-square" title="Чаты" badge={12} />
      <RailBtn icon="users" title="Сотрудники" />
      <RailBtn icon="users-round" title="Команды" />
      <RailBtn icon="video" title="Видеовстречи" />
      <RailBtn icon="panels-top-left" title="Доски" />

      <div style={{ flex: 1 }} />

      <RailBtn icon="wallet" title="Кошелёк" color="var(--red-65)" dot />
      <RailBtn icon="ellipsis" title="Ещё" />
      <RailBtn icon="circle-help" title="Помощь" />
      <div style={{ width: 32, height: 32, borderRadius: "999px", background: "var(--red-60)", margin: "4px 0", flex: "0 0 auto" }} title="ТехноНИКОЛь" />
      <Avatar text={CURRENT_USER.initials} size="md" />
    </div>
  );
}

// ---------- Панель-дерево ----------
function NavRow({ item, active, onClick }) {
  const [hover, setHover] = React.useState(false);
  const selectable = !item.group;
  const on = active;
  const depthPad = 12 + item.depth * 20;
  return (
    <button type="button" onClick={selectable ? onClick : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: "10px 12px", paddingLeft: depthPad,
        border: "none", borderRadius: "var(--radius-md)", textAlign: "left",
        cursor: selectable ? "pointer" : "default",
        background: on ? "var(--background-secondary-a-enabled)" : hover && selectable ? "var(--neutral-10)" : "transparent",
        transition: "background .12s",
      }}>
      <Icon name={item.icon} size={item.depth >= 2 ? 18 : 19}
        color={on ? "var(--content-primary-a-enabled)" : "var(--content-tertiary-enabled)"} />
      <span style={{
        flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        fontSize: 14,
        fontWeight: on ? 600 : item.depth >= 2 ? 400 : 500,
        color: on ? "var(--content-primary-a-enabled)"
          : item.depth >= 2 ? "var(--content-tertiary-enabled)" : "var(--content-secondary-enabled)",
      }}>{item.label}</span>
      {item.badge != null && <Badge count={item.badge} />}
    </button>
  );
}

function AgentPanel({ active = "new", onSelect }) {
  const { KB_MODES } = window.AUDITOR_DATA;
  const auditorBadge = (KB_MODES.find((m) => m.id === "auditor") || {}).badge;

  const nav = [
    { id: "new", icon: "message-circle", label: "Новый чат", depth: 0 },
    { id: "projects", icon: "folder-plus", label: "Проекты", depth: 0 },
    { id: "agents", icon: "star", label: "Агенты", depth: 0, group: true },
    { id: "kb", icon: "megaphone", label: "База знаний", depth: 1, group: true },
    { id: "assistant", icon: "sparkles", label: "Ассистент", depth: 2 },
    { id: "auditor", icon: "shield-check", label: "Аудитор", depth: 2, badge: auditorBadge },
    { id: "recognition", icon: "scan-text", label: "Распознавание док...", depth: 2 },
    { id: "chats", icon: "messages-square", label: "Чаты", depth: 0, group: true },
    { id: "chat1", icon: "star", label: "Генеральный дирек...", depth: 1 },
    { id: "chat2", icon: "star", label: "Генеральный дирек...", depth: 1 },
  ];

  return (
    <div style={{
      width: 330, flex: "0 0 330px", display: "flex", flexDirection: "column",
      background: "#fff", borderRight: "1px solid var(--border-secondary-enabled)",
    }}>
      {/* Свернуть */}
      <button type="button" style={{
        display: "flex", alignItems: "center", gap: 12, padding: "18px 18px 16px", border: "none",
        background: "transparent", cursor: "pointer", textAlign: "left",
      }}>
        <Icon name="panel-left-close" size={22} color="var(--content-tertiary-enabled)" />
        <span style={{ fontSize: 15, fontWeight: 500, color: "var(--content-tertiary-enabled)" }}>Свернуть</span>
      </button>
      <div style={{ height: 1, background: "var(--border-secondary-enabled)", margin: "0 18px 10px" }} />

      {/* Дерево */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map((item) => (
          <NavRow key={item.id} item={item} active={active === item.id}
            onClick={() => onSelect && onSelect(item.id)} />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Rail, AgentPanel });
