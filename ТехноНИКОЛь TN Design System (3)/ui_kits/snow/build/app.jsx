// «Снеговые мешки» — корневая оркестрация: дашборд → мастер из 7 шагов → результат.
const AppIcon = window.__lazyTN("Icon");

const CALC_STEPS = [
  "Анализ геометрии кровли и элементов",
  "Расчёт коэффициентов μ по СП 20.13330.2016",
  "Построение зон снегонакопления",
  "Подбор расстановки датчиков",
];

function Calculating({ onDone }) {
  const [step, setStep] = React.useState(0);
  const [pct, setPct] = React.useState(5);
  React.useEffect(() => {
    const t1 = setInterval(() => setPct((p) => Math.min(100, p + 4)), 90);
    const t2 = setInterval(() => setStep((s) => Math.min(CALC_STEPS.length - 1, s + 1)), 760);
    const done = setTimeout(onDone, 3100);
    return () => { clearInterval(t1); clearInterval(t2); clearTimeout(done); };
  }, []);
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--neutral-10)" }}>
      <div style={{ width: 480, background: "#fff", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-large)", padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 18 }}>
          <div style={{ width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--red-10)", borderRadius: "var(--radius-md)" }}>
            <AppIcon name="snowflake" size={24} color="var(--content-accent-enabled)" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>Идёт расчёт снеговых мешков</div>
            <div style={{ fontSize: 13, color: "var(--content-tertiary-enabled)" }}>Объект «Север-2» · 8 240 м²</div>
          </div>
        </div>
        <div style={{ height: 6, background: "var(--background-tertiary-enabled)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--background-accent-enabled)", borderRadius: 999, transition: "width .2s linear" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 20 }}>
          {CALC_STEPS.map((s, i) => {
            const done = i < step, cur = i === step;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, background: done ? "var(--green-10)" : cur ? "var(--red-10)" : "var(--background-secondary-a-enabled)" }}>
                  {done ? <AppIcon name="check" size={14} color="var(--content-system-positive)" />
                    : cur ? <AppIcon name="loader-circle" size={14} color="var(--content-accent-enabled)" style={{ animation: "tn-spin .7s linear infinite" }} />
                    : <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--neutral-35)" }} />}
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

const DEMO_UPLOAD = {
  files: [
    { name: "Кровля_Север-2.pdf", size: "2,4 МБ", desc: "план кровли", selected: true },
    { name: "Разрез_парапет.dwg", size: "0,8 МБ", desc: "узел парапета" },
  ],
  scale: "1:200",
  mapAddress: "г. Екатеринбург, Сибирский тракт, 12",
  mapSelected: true,
};

const EMPTY_UPLOAD = { files: [], scale: null, mapAddress: "", mapSelected: false };

function App() {
  const D = window.SNOW_DATA;
  const STEPS = D.STEPS;
  const [route, setRoute] = React.useState("projects"); // projects | wizard
  const [step, setStep] = React.useState(0);
  const [maxReached, setMax] = React.useState(0);
  const [calc, setCalc] = React.useState(false);
  const [showExport, setShowExport] = React.useState(false);
  const [isNewProject, setIsNewProject] = React.useState(false);
  const [upload, setUpload] = React.useState(EMPTY_UPLOAD);

  const goStep = (i) => { setStep(i); setMax((m) => Math.max(m, i)); };
  const openExisting = () => {
    setIsNewProject(false);
    setUpload(DEMO_UPLOAD);
    setRoute("wizard");
    setStep(0);
    setMax(STEPS.length - 1);
  };
  const openNew = () => {
    setIsNewProject(true);
    setUpload(EMPTY_UPLOAD);
    setRoute("wizard");
    setStep(0);
    setMax(0);
  };

  function addFile(file) {
    setUpload((u) => ({
      ...u,
      files: [...u.files.map((f) => ({ ...f, selected: false })), file],
      scale: /\.pdf$/i.test(file.name) ? "1:200" : u.scale,
    }));
  }

  function selectMap(address) {
    setUpload((u) => ({ ...u, mapAddress: address, mapSelected: true }));
  }

  const next = () => {
    const id = STEPS[step].id;
    if (id === "climate") { setCalc(true); return; }      // запуск расчёта мешков
    if (step < STEPS.length - 1) goStep(step + 1);
  };
  const back = () => { if (step > 0) goStep(step - 1); };

  // содержимое шага
  let stepContent = null;
  if (calc) {
    stepContent = <Calculating onDone={() => { setCalc(false); goStep(3); }} />;
  } else {
    const id = STEPS[step].id;
    stepContent = {
      upload: <window.StepUpload isNew={isNewProject} files={upload.files} scale={upload.scale}
        mapAddress={upload.mapAddress} mapSelected={upload.mapSelected}
        onFileAdd={addFile} onMapSelect={selectMap} />,
      roof: <window.StepRoof />,
      climate: <window.StepClimate />,
      bags: <window.StepBagsSensors />,
      result: <window.ResultView onExport={() => setShowExport(true)} />,
    }[id];
  }

  // конфигурация нижней кнопки
  const footerCfg = (() => {
    const id = STEPS[step].id;
    if (id === "climate") return { nextLabel: "Рассчитать мешки", nextIcon: "sparkles", nextVariant: "accent", hint: "Расчёт по СП 20.13330.2016" };
    if (id === "bags") return { nextLabel: "Сформировать схему", nextIcon: "arrow-right", nextVariant: "accent" };
    if (id === "result") return { nextLabel: "Экспорт документов", nextIcon: "download", nextVariant: "accent", onNext: () => setShowExport(true) };
    if (id === "roof") return { nextLabel: "Подтвердить и далее", nextIcon: "arrow-right" };
    return {};
  })();

  if (route === "projects") {
    return (
      <Frame project={null} onHome={() => setRoute("projects")}>
        <window.ProjectsView onOpen={openExisting} onNew={openNew} />
      </Frame>
    );
  }

  return (
    <Frame project={isNewProject ? null : D.PROJECT} onHome={() => setRoute("projects")}>
      <window.Stepper steps={STEPS} current={step} maxReached={maxReached} onJump={goStep} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>{stepContent}</div>
      {!calc && (
        <window.WizardFooter current={step} total={STEPS.length} onBack={back}
          onNext={footerCfg.onNext || next} nextLabel={footerCfg.nextLabel} nextIcon={footerCfg.nextIcon}
          nextVariant={footerCfg.nextVariant} hint={footerCfg.hint}
          onDraft={() => setRoute("projects")} />
      )}
      {showExport && <window.ExportDialog onClose={() => setShowExport(false)} />}
    </Frame>
  );
}

function Frame({ project, onHome, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden", background: "var(--neutral-10)" }}>
      <window.AppHeader project={project} onHome={onHome} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>{children}</div>
    </div>
  );
}

class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: false }; }
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch() {}
  render() { return this.state.err ? null : this.props.children; }
}

(function boot() {
  console.log("SNOW-BUILD-v3");
  var ns = window.TNDesignSystem_7f9df2;
  if (!ns || !ns.Button || !ns.Icon || !window.AppHeader || !window.ProjectsView) { return setTimeout(boot, 30); }
  var rootEl = document.getElementById("root");
  if (!rootEl) return;
  if (!window.__snowRoot) window.__snowRoot = ReactDOM.createRoot(rootEl);
  window.__snowRoot.render(<Boundary><App /></Boundary>);
})();
