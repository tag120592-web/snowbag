// «Снеговые мешки» — оболочка инструмента: шапка, степпер, нижняя навигация.
const ShIcon = window.__lazyTN("Icon"), ShAvatar = window.__lazyTN("Avatar"), ShButton = window.__lazyTN("Button");

function AppHeader({ project, onHome }) {
  return (
    <div style={{
      height: 64, flex: "0 0 64px", display: "flex", alignItems: "center", gap: 16,
      padding: "0 24px", background: "#fff", borderBottom: "1px solid var(--border-secondary-enabled)",
    }}>
      <button type="button" onClick={onHome} style={{ display: "flex", alignItems: "center", gap: 12, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--red-60)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>TN</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, textAlign: "left" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>Снеговые мешки</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--content-tertiary-enabled)" }}>Мониторинг снеговой нагрузки</span>
        </div>
      </button>

      {project && (
        <>
          <div style={{ width: 1, height: 26, background: "var(--border-secondary-enabled)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <ShIcon name="building-2" size={17} color="var(--content-tertiary-enabled)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--content-primary-a-enabled)", whiteSpace: "nowrap" }}>{project.name}</span>
            <span style={{ fontSize: 13, color: "var(--content-tertiary-enabled)", whiteSpace: "nowrap" }}>· {project.address}</span>
          </div>
        </>
      )}

      <div style={{ flex: 1 }} />
      <HdrIcon icon="circle-help" title="Справка" />
      <HdrIcon icon="bell" title="Уведомления" dot />
      <div style={{ width: 1, height: 26, background: "var(--border-secondary-enabled)", margin: "0 4px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ShAvatar text="ГА" size="sm" />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>Громов А. И.</span>
          <span style={{ fontSize: 11, color: "var(--content-tertiary-enabled)" }}>Инженер-проектировщик</span>
        </div>
      </div>
    </div>
  );
}

function HdrIcon({ icon, title, dot }) {
  const [h, setH] = React.useState(false);
  return (
    <button type="button" title={title} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ position: "relative", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderRadius: 8, cursor: "pointer", background: h ? "var(--neutral-10)" : "transparent", transition: "background .12s" }}>
      <ShIcon name={icon} size={20} color="var(--neutral-55)" />
      {dot && <span style={{ position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: 999, background: "var(--red-60)", border: "1.5px solid #fff" }} />}
    </button>
  );
}

// ---------- Степпер ----------
function Stepper({ steps, current, maxReached, onJump }) {
  return (
    <div style={{ height: 72, flex: "0 0 72px", display: "flex", alignItems: "center", padding: "0 24px", background: "#fff", borderBottom: "1px solid var(--border-secondary-enabled)", gap: 0 }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const reachable = i <= maxReached;
        const color = active ? "var(--red-60)" : done ? "var(--content-primary-a-enabled)" : "var(--neutral-40)";
        return (
          <React.Fragment key={s.id}>
            <button type="button" disabled={!reachable} onClick={() => reachable && onJump(i)}
              style={{ display: "flex", alignItems: "center", gap: 10, border: "none", background: "transparent", padding: "6px 8px", cursor: reachable ? "pointer" : "default", borderRadius: 8 }}>
              <span style={{
                width: 28, height: 28, flex: "0 0 28px", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                background: active ? "var(--red-60)" : done ? "var(--content-primary-a-enabled)" : "var(--neutral-15)",
                color: active || done ? "#fff" : "var(--neutral-50)",
                border: active ? "none" : done ? "none" : "1px solid var(--neutral-25)",
                transition: "all .15s",
              }}>
                {done ? <ShIcon name="check" size={15} color="#fff" /> : s.n}
              </span>
              <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 600, color, whiteSpace: "nowrap" }}>{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, minWidth: 12, background: i < current ? "var(--content-primary-a-enabled)" : "var(--neutral-20)", margin: "0 2px", borderRadius: 2 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------- Нижняя навигация мастера ----------
function WizardFooter({ current, total, onBack, onNext, nextLabel, nextIcon, nextVariant, hint, onDraft }) {
  return (
    <div style={{ height: 72, flex: "0 0 72px", display: "flex", alignItems: "center", gap: 14, padding: "0 28px", background: "#fff", borderTop: "1px solid var(--border-secondary-enabled)" }}>
      <ShButton variant="white" icon="arrow-left" size="md" onClick={onBack} disabled={current === 0}>Назад</ShButton>
      {hint && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 6 }}>
          <ShIcon name="info" size={16} color="var(--content-tertiary-enabled)" />
          <span style={{ fontSize: 13, color: "var(--content-tertiary-enabled)" }}>{hint}</span>
        </div>
      )}
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--content-tertiary-enabled)" }}>Шаг {current + 1} из {total}</span>
      {onDraft && <ShButton variant="secondary" icon="save" size="md" onClick={onDraft}>Сохранить черновик</ShButton>}
      <ShButton variant={nextVariant || "primary"} iconRight={nextIcon || "arrow-right"} size="md" onClick={onNext}>{nextLabel || "Далее"}</ShButton>
    </div>
  );
}

// ---------- Каркас рабочей области: холст слева + панель справа ----------
function WorkArea({ canvas, panel, panelWidth = 380 }) {
  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
      <div style={{ flex: 1, minWidth: 0, position: "relative", background: "var(--neutral-10)", display: "flex" }}>
        {canvas}
      </div>
      <div style={{ width: panelWidth, flex: `0 0 ${panelWidth}px`, borderLeft: "1px solid var(--border-secondary-enabled)", background: "#fff", display: "flex", flexDirection: "column", minHeight: 0 }}>
        {panel}
      </div>
    </div>
  );
}

// маленький заголовок секции панели
function PanelHead({ title, count, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "18px 20px 12px" }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>{title}</span>
      {count != null && <span style={{ fontSize: 13, fontWeight: 600, color: "var(--content-tertiary-enabled)" }}>· {count}</span>}
      <div style={{ flex: 1 }} />
      {action}
    </div>
  );
}

Object.assign(window, { AppHeader, Stepper, WizardFooter, WorkArea, PanelHead });
