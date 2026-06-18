// «Снеговые мешки» — шаги 4–6: Ориентация и климат, Снеговые мешки, Датчики.
const SB = window.__lazyNS();

function FieldRow({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--content-secondary-enabled)", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

// ============ Шаг 4 — Ориентация и климат ============
function StepClimate() {
  const C = window.SNOW_DATA.CLIMATE;
  return (
    <window.WorkArea panelWidth={400}
      canvas={<window.RoofCanvas layers={{ geometry: true, parapet: true, obstacles: true, north: true }} />}
      panel={
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%", overflowY: "auto" }}>
          <window.PanelHead title="Привязка к местности" action={<SB.Tag tone="green" size="sm" icon="map-pin">по адресу</SB.Tag>} />
          <div style={{ padding: "0 20px 6px" }}>
            <FieldRow label="Город (определён по адресу)">
              <SB.Input icon="building-2" defaultValue="Екатеринбург" />
            </FieldRow>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <FieldRow label="Снеговой район (СП 20.13330.2016)">
                <SB.Select value="3" options={[
                  { id: "2", title: "II · 1,2 кПа" }, { id: "3", title: "III · 1,8 кПа" },
                  { id: "4", title: "IV · 2,4 кПа" }, { id: "5", title: "V · 3,0 кПа" },
                ]} />
              </FieldRow>
              <FieldRow label="Ветровой район">
                <SB.Select value="2" options={[
                  { id: "1", title: "I · 0,23 кПа" }, { id: "2", title: "II · 0,30 кПа" },
                  { id: "3", title: "III · 0,38 кПа" },
                ]} />
              </FieldRow>
            </div>
          </div>

          {/* Климат-сводка */}
          <div style={{ margin: "4px 20px 16px", padding: "14px 16px", background: "var(--neutral-10)", borderRadius: "var(--radius-lg)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
            <Metric k="Вес снег. покрова, Sg" v={`${C.sg} кПа`} sub={`${C.sgKg} кг/м²`} />
            <Metric k="Ветровое давление, w₀" v={`${C.w0} кПа`} sub="тип местности B" />
          </div>

          <window.PanelHead title="Ориентация и роза ветров" />
          <div style={{ display: "flex", gap: 14, padding: "0 20px 20px", alignItems: "center" }}>
            <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <window.NorthArrow size={84} deg={C.northDeg} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--content-secondary-enabled)" }}>Север {C.northDeg}°</span>
            </div>
            <div style={{ flex: 1, background: "#fff", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-lg)", padding: 12, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <window.WindRose size={150} north={C.northDeg} />
              <span style={{ fontSize: 12, color: "var(--content-tertiary-enabled)", marginTop: 4 }}>Преобладающий ветер — <b style={{ color: "var(--red-60)" }}>З, ЮЗ</b></span>
            </div>
          </div>
          <div style={{ margin: "0 20px 20px", padding: "12px 16px", background: "var(--blue-10)", borderRadius: "var(--radius-md)", display: "flex", gap: 10 }}>
            <SB.Icon name="wind" size={18} color="var(--blue-60)" />
            <span style={{ fontSize: 12.5, color: "var(--blue-65)", lineHeight: 1.45 }}>Снеговые мешки формируются преимущественно с подветренной (восточной) стороны препятствий и парапетов.</span>
          </div>
        </div>
      }
    />
  );
}

function Metric({ k, v, sub }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--content-tertiary-enabled)" }}>{k}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--content-primary-a-enabled)", lineHeight: 1.2 }}>{v}</div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--content-tertiary-enabled)" }}>{sub}</div>}
    </div>
  );
}

// ============ Шаг 4 — Снеговые мешки и датчики (объединённый) ============
function StepBagsSensors() {
  const D = window.SNOW_DATA;
  const [tab, setTab] = React.useState("bags");
  const [zone, setZone] = React.useState(null);
  const [sensor, setSensor] = React.useState(null);
  const bags = D.SNOWBAGS;
  const onSelect = (id) => {
    if (/^Z/.test(id)) { setTab("bags"); setZone((z) => z === id ? null : id); }
    else { setTab("sensors"); setSensor(id); }
  };
  const selId = tab === "bags" ? zone : sensor;
  return (
    <window.WorkArea panelWidth={400}
      canvas={
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <window.RoofCanvas layers={{ geometry: true, parapet: true, obstacles: true, bags: true, sensors: true, north: true, sensorDims: tab === "sensors" && !!sensor }} selectedId={selId} onSelect={onSelect} />
          <Legend />
        </div>
      }
      panel={
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}>
          <div style={{ padding: "16px 20px 10px" }}>
            <SB.Tabs variant="segmented" value={tab}
              options={[{ id: "bags", name: "Снеговые мешки", secondaryText: bags.length, icon: "snowflake" }, { id: "sensors", name: "Датчики", secondaryText: D.SENSORS.length, icon: "radio" }]}
              onChange={setTab} />
          </div>
          {tab === "bags" ? (
            <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
              <div style={{ display: "flex", gap: 8, padding: "0 20px 12px" }}>
                <Chip tone="red" n={D.METRICS.risk.critical} t="критич." />
                <Chip tone="orange" n={D.METRICS.risk.high} t="высоких" />
                <Chip tone="yellow" n={D.METRICS.risk.medium} t="средних" />
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {bags.map((z) => <BagCard key={z.id} z={z} on={zone === z.id} onClick={() => setZone(zone === z.id ? null : z.id)} />)}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
              <div style={{ display: "flex", gap: 10, padding: "0 20px 14px" }}>
                <StatBox v={`${D.METRICS.coverage}%`} k="покрытие зон" />
                <StatBox v="18,5 м" k="ср. шаг сетки" />
                <StatBox v="3,0 м" k="до парапета" />
              </div>
              <div style={{ padding: "0 20px 12px" }}>
                <SB.Button variant="white" size="sm" icon="plus" block>Добавить датчик</SB.Button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
                {D.SENSORS.map((s) => {
                  const z = D.SNOWBAGS.find((b) => b.id === s.zone);
                  const m = z ? window.RISK_META[z.risk] : null;
                  return (
                    <SB.Cell key={s.id} selected={s.id === sensor} onClick={() => setSensor(s.id)}
                      leftIcon="radio" title={`Датчик ${s.id}`}
                      subtitle={z ? `Зона ${z.id} · ${z.name}` : "Контрольная точка"}
                      rightSlot={m ? <SB.Tag tone={m.tone} size="sm">{z.load} кПа</SB.Tag> : <SB.Tag tone="neutral" size="sm">норма</SB.Tag>} />
                  );
                })}
              </div>
              {sensor && (() => {
                const s = D.SENSORS.find((x) => x.id === sensor);
                return (
                  <div style={{ padding: 18, borderTop: "1px solid var(--border-secondary-enabled)", background: "var(--neutral-10)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <SB.Icon name="move" size={16} color="var(--content-accent-enabled)" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>Перемещение датчика {s.id}</span>
                      <div style={{ flex: 1 }} />
                      <SB.Button variant="white" icon="x" size="sm" aria-label="Закрыть" onClick={() => setSensor(null)} />
                    </div>
                    <span style={{ fontSize: 12, color: "var(--content-tertiary-enabled)", lineHeight: 1.45, display: "block", marginBottom: 10 }}>Расстояния до парапетов и ближайшего элемента показаны на плане. Задайте точное расположение или перетащите точку.</span>
                    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                      <div style={{ flex: 1 }}><FieldRow label="X, м"><SB.Input size="sm" defaultValue={String(Math.round(s.x / 6.6))} /></FieldRow></div>
                      <div style={{ flex: 1 }}><FieldRow label="Y, м"><SB.Input size="sm" defaultValue={String(Math.round(s.y / 6.6))} /></FieldRow></div>
                    </div>
                    <SB.Button variant="secondary" size="sm" icon="check" block onClick={() => setSensor(null)}>Зафиксировать</SB.Button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      }
    />
  );
}

function BagCard({ z, on, onClick }) {
  const m = window.RISK_META[z.risk];
  return (
    <button type="button" onClick={onClick} style={{ textAlign: "left", border: `1px solid ${on ? m.line : "var(--border-secondary-enabled)"}`, borderLeft: `4px solid ${m.fill}`, borderRadius: "var(--radius-md)", background: on ? m.soft : "#fff", padding: "12px 14px", cursor: "pointer", transition: "all .12s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: m.line }}>{z.id}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>{z.name}</span>
        <div style={{ flex: 1 }} />
        <SB.Tag tone={m.tone} size="sm">{m.label}</SB.Tag>
      </div>
      <div style={{ display: "flex", gap: 18, marginBottom: 6 }}>
        <Mini k="Коэф. μ" v={z.mu.toLocaleString("ru")} />
        <Mini k="Нагрузка S" v={`${z.load} кПа`} />
        <Mini k="Площадь" v={`${z.area} м²`} />
      </div>
      <div style={{ fontSize: 12, color: "var(--content-tertiary-enabled)", display: "flex", alignItems: "center", gap: 6 }}>
        <SB.Icon name="info" size={13} color="var(--content-tertiary-enabled)" />Основание: {z.basis}
      </div>
    </button>
  );
}

function Mini({ k, v }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--content-tertiary-enabled)" }}>{k}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>{v}</div>
    </div>
  );
}

function Chip({ tone, n, t }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, padding: "8px 10px", borderRadius: "var(--radius-md)", background: `var(--${tone}-10)` }}>
      <span style={{ fontSize: 17, fontWeight: 800, color: `var(--${tone}-${tone === "yellow" ? 40 : 60})` }}>{n}</span>
      <span style={{ fontSize: 12, color: "var(--content-secondary-enabled)" }}>{t}</span>
    </div>
  );
}

function Legend() {
  const items = [["critical", "Критическая"], ["high", "Высокая"], ["medium", "Средняя"]];
  return (
    <div style={{ position: "absolute", left: 24, bottom: 20, display: "flex", gap: 14, background: "rgba(255,255,255,.92)", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", padding: "8px 14px", backdropFilter: "blur(2px)" }}>
      {items.map(([r, l]) => (
        <div key={r} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: window.RISK_META[r].fill, opacity: 0.7 }} />
          <span style={{ fontSize: 12, color: "var(--content-secondary-enabled)" }}>{l}</span>
        </div>
      ))}
      <div style={{ width: 1, background: "var(--border-secondary-enabled)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 11, height: 11, borderRadius: 999, background: "var(--red-60)", border: "2px solid #fff", boxShadow: "0 0 0 1px var(--red-60)" }} />
        <span style={{ fontSize: 12, color: "var(--content-secondary-enabled)" }}>Датчик</span>
      </div>
    </div>
  );
}

function StatBox({ v, k }) {
  return (
    <div style={{ flex: 1, background: "var(--neutral-10)", borderRadius: "var(--radius-md)", padding: "10px 12px" }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: "var(--content-primary-a-enabled)" }}>{v}</div>
      <div style={{ fontSize: 11.5, color: "var(--content-tertiary-enabled)" }}>{k}</div>
    </div>
  );
}

Object.assign(window, { StepClimate, StepBagsSensors });
