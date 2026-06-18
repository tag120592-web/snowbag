// Аудитор UI kit — admin dashboard (по роли): здоровье базы, типы, горячие точки,
// неактивные владельцы, веса критичности.
const { Icon, Card, Tag, Button, Avatar } = window.TNDesignSystem_7f9df2;

function HealthRing({ value }) {
  const r = 52, c = 2 * Math.PI * r;
  const tone = value >= 80 ? "var(--content-system-positive)" : value >= 60 ? "var(--content-system-warning)" : "var(--content-system-negative)";
  return (
    <div style={{ position: "relative", width: 132, height: 132, flex: "0 0 auto" }}>
      <svg width="132" height="132" viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={r} fill="none" stroke="var(--background-tertiary-enabled)" strokeWidth="11" />
        <circle cx="66" cy="66" r={r} fill="none" stroke={tone} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 66 66)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 34, fontWeight: 800, color: "var(--content-primary-a-enabled)", lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 11.5, color: "var(--content-tertiary-enabled)", marginTop: 2 }}>из 100</span>
      </div>
    </div>
  );
}

function TypeCounter({ icon, label, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)" }}>
      <div style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background-secondary-a-enabled)", borderRadius: "var(--radius-sm)" }}>
        <Icon name={icon} size={18} color="var(--content-secondary-enabled)" />
      </div>
      <span style={{ flex: 1, fontSize: 13, color: "var(--content-secondary-enabled)" }}>{label}</span>
      <span style={{ fontSize: 20, fontWeight: 800, color: "var(--content-primary-a-enabled)" }}>{count}</span>
    </div>
  );
}

function SectionTitle({ icon, children, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <Icon name={icon} size={18} color="var(--content-accent-enabled)" />
      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>{children}</span>
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
}

function AdminDashboard({ onBack }) {
  const { DASHBOARD, PTYPE } = window.AUDITOR_DATA;
  const d = DASHBOARD;
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--neutral-10)" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 24px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Tag tone="purple" size="md" icon="shield">Доступно администратору базы знаний</Tag>
          <div style={{ flex: 1 }} />
          <Button variant="white" icon="arrow-left" onClick={onBack}>К проверке</Button>
        </div>

        {/* top row: health + counters */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, marginBottom: 16 }}>
          <Card padding="lg">
            <SectionTitle icon="activity">Индекс здоровья</SectionTitle>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <HealthRing value={d.health} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Tag tone="green" size="md" icon="trending-up">+{d.trend} за месяц</Tag>
                <span style={{ fontSize: 12.5, color: "var(--content-tertiary-enabled)", maxWidth: 130 }}>Снижают дубль в кадрах и противоречие по СИЗ</span>
              </div>
            </div>
          </Card>
          <Card padding="lg">
            <SectionTitle icon="list-checks">Проблемы по типам</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <TypeCounter icon={PTYPE.contradiction.icon} label="Противоречия" count={d.totals.contradiction} />
              <TypeCounter icon={PTYPE.duplicate.icon} label="Дубли" count={d.totals.duplicate} />
              <TypeCounter icon={PTYPE.broken.icon} label="Битые ссылки" count={d.totals.broken} />
              <TypeCounter icon={PTYPE.ownerless.icon} label="Без владельца" count={d.totals.ownerless} />
            </div>
          </Card>
        </div>

        {/* hotspots */}
        <Card padding="lg" style={{ marginBottom: 16 }}>
          <SectionTitle icon="flame">Горячие точки по подразделениям</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {d.hotspots.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 130, fontSize: 13.5, color: "var(--content-primary-a-enabled)", fontWeight: 500 }}>{h.dept}</span>
                <div style={{ flex: 1, height: 10, background: "var(--background-tertiary-enabled)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${h.share}%`, height: "100%", background: i === 0 ? "var(--red-60)" : "var(--red-40)", borderRadius: "999px" }} />
                </div>
                <span style={{ width: 28, textAlign: "right", fontSize: 13.5, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>{h.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* contradiction map between departments */}
        <Card padding="lg" style={{ marginBottom: 16 }}>
          <SectionTitle icon="git-compare">Карта противоречий между подразделениями</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {d.contradictionMap.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>{m.a}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, background: "var(--red-10)", borderRadius: "var(--radius-pill)" }}>
                    <Icon name="arrow-left-right" size={14} color="var(--content-accent-enabled)" />
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>{m.b}</span>
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: "var(--content-secondary-enabled)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.topic}</span>
                <Tag tone={m.tone} size="sm">{m.level}</Tag>
              </div>
            ))}
          </div>
        </Card>

        {/* inactive owners */}
        <Card padding="lg" style={{ marginBottom: 16 }}>
          <SectionTitle icon="user-x">Владельцы: давно не заходили</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 70px 130px", gap: 12, padding: "0 4px 8px", fontSize: 11.5, fontWeight: 600, color: "var(--content-tertiary-enabled)", textTransform: "uppercase", letterSpacing: ".03em", borderBottom: "1px solid var(--border-secondary-enabled)" }}>
              <span>Владелец</span><span>Подразделение</span><span style={{ textAlign: "right" }}>Статей</span><span style={{ textAlign: "right" }}>Послед. вход</span>
            </div>
            {d.inactiveOwners.map((o, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 150px 70px 130px", gap: 12, alignItems: "center", padding: "10px 4px", borderBottom: i < d.inactiveOwners.length - 1 ? "1px solid var(--border-secondary-enabled)" : "none" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Avatar text={o.initials} size="sm" status={o.inactive ? "red" : "gray"} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>{o.name}</span>
                  {o.inactive && <Tag tone="red" size="sm">неактивен</Tag>}
                </span>
                <span style={{ fontSize: 13, color: "var(--content-secondary-enabled)" }}>{o.dept}</span>
                <span style={{ fontSize: 13, color: "var(--content-secondary-enabled)", textAlign: "right" }}>{o.pages}</span>
                <span style={{ fontSize: 13, color: o.inactive ? "var(--content-system-negative)" : "var(--content-secondary-enabled)", textAlign: "right", fontWeight: o.inactive ? 600 : 400 }}>{o.lastLogin}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* severity weights */}
        <Card padding="lg">
          <SectionTitle icon="sliders-horizontal" right={<Button variant="link" icon="pencil">Изменить</Button>}>Уровни критичности по разделам</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {d.weights.map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)" }}>
                <div style={{ width: 120 }}><Tag tone={w.tone} size="md">{w.level}</Tag></div>
                <Icon name="arrow-right" size={16} color="var(--content-tertiary-enabled)" />
                <span style={{ flex: 1, fontSize: 13.5, color: "var(--content-secondary-enabled)" }}>{w.scope}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-secondary-enabled)" }}>
            <Icon name="eye" size={17} color="var(--content-secondary-enabled)" />
            <span style={{ flex: 1, fontSize: 13.5, color: "var(--content-primary-a-enabled)", fontWeight: 500 }}>Учитывать просмотры при оценке охвата</span>
            <span style={{ fontSize: 12.5, color: "var(--content-tertiary-enabled)" }}>включено</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { AdminDashboard });
