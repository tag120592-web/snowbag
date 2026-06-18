// Аудитор UI kit — root orchestration.
// Modes: assistant (existing Q&A, shown for the nested switch) / auditor.
// Auditor flow: landing → scanning → report. Admin: dashboard (by role).
const { Icon, Button, EmptyContent } = window.TNDesignSystem_7f9df2;

const IS_ADMIN = true; // Виктория — администратор базы знаний

const SCAN_STEPS = [
  "Индексация статей раздела",
  "Поиск дублей и пересечений",
  "Сверка противоречий между статьями",
  "Проверка ссылок и владельцев",
];

function Scanning({ query, onDone }) {
  const [step, setStep] = React.useState(0);
  const [pct, setPct] = React.useState(6);
  React.useEffect(() => {
    const t1 = setInterval(() => setPct((p) => Math.min(100, p + 4)), 80);
    const t2 = setInterval(() => setStep((s) => Math.min(SCAN_STEPS.length - 1, s + 1)), 620);
    const done = setTimeout(onDone, 2700);
    return () => { clearInterval(t1); clearInterval(t2); clearTimeout(done); };
  }, []);
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--neutral-10)" }}>
      <div style={{ width: 460, background: "#fff", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-large)", padding: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--red-10)", borderRadius: "var(--radius-md)" }}>
            <Icon name="shield-check" size={24} color="var(--content-accent-enabled)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>Идёт проверка</div>
            <div style={{ fontSize: 12.5, color: "var(--content-tertiary-enabled)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 360 }}>{query}</div>
          </div>
        </div>
        <div style={{ height: 6, background: "var(--background-tertiary-enabled)", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--background-accent-enabled)", borderRadius: "999px", transition: "width .2s linear" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
          {SCAN_STEPS.map((s, i) => {
            const done = i < step, cur = i === step;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "999px", background: done ? "var(--green-10)" : cur ? "var(--red-10)" : "var(--background-secondary-a-enabled)" }}>
                  {done ? <Icon name="check" size={14} color="var(--content-system-positive)" />
                    : cur ? <Icon name="loader-circle" size={14} color="var(--content-accent-enabled)" style={{ animation: "tn-spin .7s linear infinite" }} />
                    : <span style={{ width: 6, height: 6, borderRadius: "999px", background: "var(--neutral-35)" }} />}
                </span>
                <span style={{ fontSize: 14, color: done || cur ? "var(--content-primary-a-enabled)" : "var(--content-tertiary-enabled)" }}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes tn-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const AUDITOR_CFG = {
  placeholder: "Проверьте тему или раздел…",
  suggestLabel: "С чего начать",
  suggestions: window.AUDITOR_DATA.SUGGESTIONS_AUDITOR,
  heading: (
    <div>
      <div style={{ fontSize: 19, fontWeight: 700, color: "var(--content-primary-a-enabled)", lineHeight: "26px" }}>
        Аудитор базы знаний
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, color: "var(--content-primary-a-enabled)", lineHeight: "26px" }}>
        Найду дубли, противоречия и битые ссылки — <span style={{ color: "var(--content-accent-enabled)" }}>что проверим?</span>
      </div>
    </div>
  ),
};
const ASSISTANT_CFG = {
  placeholder: "Спросите что-нибудь...",
  suggestLabel: "Часто задаваемые вопросы",
  suggestions: window.AUDITOR_DATA.SUGGESTIONS_ASSISTANT,
  heading: (
    <div>
      <div style={{ fontSize: 19, fontWeight: 700, color: "var(--content-primary-a-enabled)", lineHeight: "26px" }}>
        Привет, {window.AUDITOR_DATA.CURRENT_USER.name}!
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, color: "var(--content-primary-a-enabled)", lineHeight: "26px" }}>
        Я твой ассистент — <span style={{ color: "var(--content-accent-enabled)" }}>Тини</span>, чем могу помочь?
      </div>
    </div>
  ),
};

function App() {
  const [nav, setNav] = React.useState("new"); // выбранный пункт дерева
  const [view, setView] = React.useState("landing"); // landing | scanning | report | dashboard (для Аудитора)
  const [query, setQuery] = React.useState("");

  const runAudit = (q) => { setQuery(q); setView("scanning"); };

  const onSelect = (id) => {
    setNav(id);
    if (id === "auditor") { setView("landing"); }
  };

  // Что показывать в контентной области.
  let content;
  if (nav === "auditor") {
    if (view === "dashboard") content = <AdminDashboard onBack={() => setView("landing")} />;
    else if (view === "landing") content = <AgentLanding config={AUDITOR_CFG} onSubmit={runAudit} />;
    else if (view === "scanning") content = <Scanning query={query} onDone={() => setView("report")} />;
    else content = <AuditorReport query={query} onNewQuery={() => setView("landing")} onDashboard={IS_ADMIN ? () => setView("dashboard") : null} />;
  } else if (nav === "new" || nav === "assistant") {
    content = <AgentLanding config={ASSISTANT_CFG} onSubmit={() => {}} />;
  } else {
    content = (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <EmptyContent icon="hammer" title="Раздел в разработке" description="Этот пункт меню — часть супераппа и в прототипе не наполнен." />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden", background: "#fff", boxSizing: "border-box" }}>
      {/* Верхняя акцентная полоса — на всю ширину */}
      <div style={{ height: 3, flex: "0 0 3px", background: "var(--blue-20)" }} />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <Rail />
        {/* Скруглённая карточка приложения */}
        <div style={{
          flex: 1, minWidth: 0, margin: "14px 16px 16px 4px", display: "flex", flexDirection: "column",
          background: "#fff", borderRadius: "var(--radius-xl)", overflow: "hidden",
          boxShadow: "var(--shadow-small)", border: "1px solid var(--border-secondary-enabled)",
        }}>
          <Topbar title="ИИ-ассистент" />
          <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
            <AgentPanel active={nav} onSelect={onSelect} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
