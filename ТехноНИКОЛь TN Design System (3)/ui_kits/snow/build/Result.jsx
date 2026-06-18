// «Снеговые мешки» — шаг 7: результат, предпросмотр 2D/3D, экспорт документов.
const SR = window.__lazyNS();

function ResultView({ onExport }) {
  const D = window.SNOW_DATA, M = D.METRICS;
  const [view, setView] = React.useState("2d");
  const [showShare, setShowShare] = React.useState(false);
  const P = D.PROJECT;
  return (
    <window.WorkArea panelWidth={400}
      canvas={
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "#fff", borderBottom: "1px solid var(--border-secondary-enabled)" }}>
            <SR.Tabs variant="segmented" value={view}
              options={[{ id: "2d", name: "2D-схема", icon: "map" }, { id: "3d", name: "3D-карта снега", icon: "box" }]}
              onChange={setView} />
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12.5, color: "var(--content-tertiary-enabled)" }}>{D.PROJECT.norm}</span>
          </div>
          <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
            <window.RoofCanvas view3d={view === "3d"}
              layers={{ geometry: true, parapet: true, obstacles: true, walkway: view === "2d", bags: true, sensors: true, dims: view === "2d", north: true }} />
            <Legend />
            {view === "3d" && (
              <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,.92)", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", padding: "8px 12px", fontSize: 12, color: "var(--content-secondary-enabled)" }}>
                Высота снежного покрова — аналог тепловой карты
              </div>
            )}
          </div>
        </div>
      }
      panel={
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <window.PanelHead title="О расчёте" />
            <div style={{ padding: "0 20px 6px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
              <InfoRow k="Объект" v={P.name} />
              <InfoRow k="№ объекта (КИСО)" v={P.number} mono />
              <InfoRow k="Номер расчёта" v={P.calcNo} mono />
              <InfoRow k="Заказчик расчёта" v={P.customer} />
            </div>
            <details style={{ margin: "6px 20px 10px" }}>
              <summary style={{ cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--content-accent-enabled)" }}>История расчётов объекта · {D.CALC_HISTORY.length}</summary>
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {D.CALC_HISTORY.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: `1px solid ${c.current ? "var(--red-60)" : "var(--border-secondary-enabled)"}`, borderRadius: "var(--radius-md)", background: c.current ? "var(--red-10)" : "#fff", cursor: "pointer" }}>
                    <SR.Icon name="file-text" size={16} color="var(--content-tertiary-enabled)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>{c.no}{c.current ? " · текущий" : ""}</div>
                      <div style={{ fontSize: 11.5, color: "var(--content-tertiary-enabled)" }}>{c.date} · {c.author}</div>
                    </div>
                    <SR.Tag tone={c.tone} size="sm">{c.status}</SR.Tag>
                  </div>
                ))}
              </div>
            </details>

            <window.PanelHead title="Итоговые показатели" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 20px 8px" }}>
              <ResMetric icon="square-dashed" v={`${M.roofArea} м²`} k="Площадь кровли" tone="blue" />
              <ResMetric icon="snowflake" v={`${M.bagsArea} м²`} k={`Снеговые мешки · ${M.bagsShare}%`} tone="orange" />
              <ResMetric icon="radio" v={`${M.sensors} шт.`} k="Датчиков" tone="red" />
              <ResMetric icon="gauge" v={`${M.maxLoad} кПа`} k="Макс. нагрузка" tone="red" />
            </div>

            <window.PanelHead title="Спецификация оборудования" />
            <div style={{ padding: "0 20px 8px" }}>
              {D.SPEC.map((s) => (
                <div key={s.pos} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--neutral-15)" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--content-tertiary-enabled)", width: 16 }}>{s.pos}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--content-primary-a-enabled)" }}>{s.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--content-tertiary-enabled)" }}>{s.note}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--content-primary-a-enabled)", whiteSpace: "nowrap" }}>{s.qty} {s.unit}</span>
                </div>
              ))}
            </div>

            <window.PanelHead title="Состав комплекта" />
            <div style={{ padding: "0 12px 12px" }}>
              <SR.Cell leftIcon="file-text" title="PDF-схема проекта" subtitle="План, мешки, датчики, легенда" rightText="A1" />
              <SR.Cell leftIcon="sheet" title="Excel-отчёт" subtitle="Площади, координаты, спецификация" rightText="XLSX" />
              <SR.Cell leftIcon="braces" title="Выгрузка JSON" subtitle="Для интеграции с CRM / BIM" rightText="JSON" />
            </div>
          </div>
          <div style={{ padding: 16, borderTop: "1px solid var(--border-secondary-enabled)", display: "flex", gap: 10 }}>
            <SR.Button variant="white" icon="share-2" size="md" onClick={() => setShowShare(true)}>Поделиться</SR.Button>
            <SR.Button variant="accent" icon="download" size="md" block onClick={onExport}>Экспорт документов</SR.Button>
          </div>
          {showShare && <ShareDialog onClose={() => setShowShare(false)} />}
        </div>
      }
    />
  );
}

function ResMetric({ icon, v, k, tone }) {
  return (
    <div style={{ background: "var(--neutral-10)", borderRadius: "var(--radius-lg)", padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <SR.Icon name={icon} size={17} color={`var(--${tone}-60)`} />
      </div>
      <div style={{ fontSize: 19, fontWeight: 800, color: "var(--content-primary-a-enabled)", lineHeight: 1.1 }}>{v}</div>
      <div style={{ fontSize: 11.5, color: "var(--content-tertiary-enabled)", marginTop: 2 }}>{k}</div>
    </div>
  );
}

// ---------- Диалог экспорта ----------
function ExportDialog({ onClose }) {
  const [done, setDone] = React.useState(false);
  const docs = [
    { icon: "file-text", t: "PDF-схема проекта", s: "Формат A1 · корпоративный штамп ТехноНИКОЛь", on: true },
    { icon: "sheet", t: "Excel-отчёт", s: "Площади, координаты датчиков, спецификация", on: true },
    { icon: "braces", t: "JSON для интеграции", s: "Геометрия, зоны, датчики", on: false },
  ];
  return (
    <SR.Dialog title="Экспорт документов" width={460} onClose={onClose}
      footer={done
        ? <SR.Button variant="primary" icon="check" onClick={onClose}>Готово</SR.Button>
        : <><SR.Button variant="secondary" onClick={onClose}>Отмена</SR.Button><SR.Button variant="accent" icon="download" onClick={() => setDone(true)}>Сформировать</SR.Button></>}>
      {done ? (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ width: 56, height: 56, margin: "0 auto 14px", borderRadius: 999, background: "var(--green-10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SR.Icon name="check" size={28} color="var(--green-55)" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>Документы сформированы</div>
          <div style={{ fontSize: 13.5, color: "var(--content-tertiary-enabled)", marginTop: 4 }}>Комплект проектной документации по объекту «Север-2» готов к скачиванию.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13.5, color: "var(--content-secondary-enabled)", marginBottom: 2 }}>Выберите выходные документы:</div>
          {docs.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)" }}>
              <SR.Icon name={d.icon} size={20} color="var(--content-secondary-enabled)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>{d.t}</div>
                <div style={{ fontSize: 12, color: "var(--content-tertiary-enabled)" }}>{d.s}</div>
              </div>
              <SR.Switch defaultChecked={d.on} size="sm" />
            </div>
          ))}
        </div>
      )}
    </SR.Dialog>
  );
}

function InfoRow({ k, v, mono }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--content-tertiary-enabled)" }}>{k}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)", fontFamily: mono ? "var(--font-family-mono, monospace)" : undefined }}>{v}</div>
    </div>
  );
}

function ShareDialog({ onClose }) {
  const P = window.SNOW_DATA.PROJECT;
  return (
    <SR.Dialog title="Поделиться расчётом" width={460} onClose={onClose}
      footer={<><SR.Button variant="secondary" onClick={onClose}>Закрыть</SR.Button><SR.Button variant="accent" icon="copy">Скопировать ссылку</SR.Button></>}>
      <div style={{ fontSize: 13.5, color: "var(--content-secondary-enabled)", marginBottom: 12 }}>Защищённая ссылка на расчёт <b>{P.calcNo}</b> объекта «Север-2». Доступ по корпоративному SSO ТехноНИКОЛь.</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", background: "var(--neutral-10)" }}>
        <SR.Icon name="link" size={16} color="var(--content-tertiary-enabled)" />
        <span style={{ fontSize: 13, fontFamily: "monospace", color: "var(--content-secondary-enabled)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>https://snow.tn.ru/calc/РС-2025-0042</span>
      </div>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        <SR.Switch label="Доступ только для просмотра" defaultChecked size="sm" />
        <SR.Switch label="Ссылка действует 30 дней" size="sm" />
      </div>
    </SR.Dialog>
  );
}

Object.assign(window, { ResultView, ExportDialog });
