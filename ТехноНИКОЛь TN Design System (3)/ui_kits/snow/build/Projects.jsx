// «Снеговые мешки» — дашборд проектов (точка входа).
const PrIcon = window.__lazyTN("Icon"), PrButton = window.__lazyTN("Button"), PrTag = window.__lazyTN("Tag"), PrSearch = window.__lazyTN("Search"), PrAvatar = window.__lazyTN("Avatar");

const PR_COLS = "minmax(0,2.1fr) 1.15fr 1fr 0.8fr 0.7fr 0.95fr 36px";

const PR_MONTHS = { "января": 0, "февраля": 1, "марта": 2, "апреля": 3, "мая": 4, "июня": 5, "июля": 6, "августа": 7, "сентября": 8, "октября": 9, "ноября": 10, "декабря": 11 };
function prDate(s) { const m = String(s).split(" "); return new Date(+m[2] || 0, PR_MONTHS[m[1]] || 0, +m[0] || 1).getTime(); }

function ProjectsView({ onOpen, onNew }) {
  const D = window.SNOW_DATA;
  const rows = [...D.PROJECTS].sort((a, b) => prDate(b.created) - prDate(a.created));
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--neutral-10)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 40px 48px" }}>
        {/* Заголовок */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--content-primary-a-enabled)", letterSpacing: "-0.01em" }}>Проекты</h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--content-tertiary-enabled)" }}>Проектирование систем мониторинга снеговой нагрузки на плоских кровлях</p>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 280 }}><PrSearch placeholder="Поиск по объектам" size="lg" /></div>
          <PrButton variant="accent" icon="plus" size="lg" rounded onClick={onNew}>Новый проект</PrButton>
        </div>

        {/* Таблица проектов */}
        <div style={{ background: "#fff", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "14px 22px", borderBottom: "1px solid var(--border-secondary-enabled)" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>Все объекты</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--content-tertiary-enabled)", marginLeft: 8 }}>· {D.PROJECTS.length}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: PR_COLS, alignItems: "center", padding: "10px 22px", borderBottom: "1px solid var(--neutral-15)", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", color: "var(--content-tertiary-enabled)", textTransform: "uppercase" }}>
            <span>Объект</span><span>№ объекта</span><span>Город</span><span>Площадь</span><span>Датчики</span><span>Статус</span><span></span>
          </div>

          {rows.map((p, i) => <ProjectRow key={i} p={p} onOpen={onOpen} />)}
        </div>
      </div>
    </div>
  );
}

function PrInfo({ k, v, mono }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--content-tertiary-enabled)", marginBottom: 2 }}>{k}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--content-primary-a-enabled)", fontFamily: mono ? "var(--font-family-mono, monospace)" : "inherit" }}>{v}</div>
    </div>
  );
}

function ProjectRow({ p, onOpen }) {
  const D = window.SNOW_DATA;
  const [h, setH] = React.useState(false);
  const [open, setOpen] = React.useState(!!p.current);
  const history = p.current ? D.CALC_HISTORY : null;
  return (
    <div style={{ borderBottom: "1px solid var(--neutral-15)" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ width: "100%", textAlign: "left", border: "none", cursor: "pointer", background: h || open ? "var(--neutral-10)" : "#fff", display: "grid", gridTemplateColumns: PR_COLS, alignItems: "center", padding: "16px 22px", transition: "background .12s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
          <PrAvatar icon="building-2" square size="md" color="var(--blue-10)" />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--content-primary-a-enabled)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
              {p.current && <PrTag tone="red" size="sm">текущий</PrTag>}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--content-tertiary-enabled)", marginTop: 2 }}>Дата создания: {p.created} · расчётов: {p.calcs}</div>
          </div>
        </div>
        <span style={{ fontSize: 13.5, fontFamily: "var(--font-family-mono, monospace)", color: "var(--content-secondary-enabled)" }}>{p.number}</span>
        <span style={{ fontSize: 14, color: "var(--content-secondary-enabled)" }}>{p.city}</span>
        <span style={{ fontSize: 14, color: "var(--content-secondary-enabled)" }}>{p.area} м²</span>
        <span style={{ fontSize: 14, color: "var(--content-secondary-enabled)" }}>{p.sensors || "—"}</span>
        <span><PrTag tone={p.tone} size="md">{p.status}</PrTag></span>
        <span style={{ display: "flex", justifyContent: "flex-end", transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}><PrIcon name="chevron-right" size={18} color="var(--neutral-40)" /></span>
      </button>

      {/* Раскрытый блок «О расчёте» */}
      {open && (
        <div style={{ padding: "4px 22px 20px 75px", background: "var(--neutral-10)" }}>
          <div style={{ background: "#fff", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-lg)", padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>О расчёте</span>
              <div style={{ flex: 1 }} />
              <PrButton variant="accent" icon="arrow-right" size="sm" onClick={() => onOpen(p)}>Открыть расчёт</PrButton>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 16px", marginBottom: history ? 16 : 0 }}>
              <PrInfo k="Объект" v={p.name} />
              <PrInfo k="№ объекта (КИСО)" v={p.number} mono />
              <PrInfo k="Город" v={p.city} />
              <PrInfo k="Номер расчёта" v={p.calcNo} mono />
              <PrInfo k="Заказчик расчёта" v={p.customer} />
              <PrInfo k="Всего расчётов" v={`${p.calcs} шт.`} />
            </div>

            {history && (
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--content-tertiary-enabled)", marginBottom: 8 }}>История расчётов объекта · {history.length}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {history.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: `1px solid ${c.current ? "var(--red-60)" : "var(--border-secondary-enabled)"}`, borderRadius: "var(--radius-md)", background: c.current ? "var(--red-10)" : "#fff" }}>
                      <PrIcon name="file-text" size={16} color="var(--content-tertiary-enabled)" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>{c.no}{c.current ? " · текущий" : ""}</div>
                        <div style={{ fontSize: 11.5, color: "var(--content-tertiary-enabled)" }}>{c.date} · {c.author}</div>
                      </div>
                      <PrTag tone={c.tone} size="sm">{c.status}</PrTag>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ProjectsView, PrInfo });
