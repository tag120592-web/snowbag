// «Снеговые мешки» — шаг 1 «Загрузка данных» и объединённый шаг 2 «Геометрия и элементы».
const SA = window.__lazyNS();

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " Б";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1).replace(".", ",") + " КБ";
  return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",") + " МБ";
}

// ============ Шаг 1 — Загрузка данных ============
function StepUpload({
  isNew = false,
  files = [],
  scale = null,
  mapAddress = "",
  mapSelected = false,
  onFileAdd,
  onMapSelect,
}) {
  const [tab, setTab] = React.useState("file");
  const [zoom, setZoom] = React.useState(100);
  const [rot, setRot] = React.useState(0);
  const [address, setAddress] = React.useState(mapAddress);
  const fileRef = React.useRef(null);

  React.useEffect(() => { setAddress(mapAddress); }, [mapAddress]);

  const hasFile = files.length > 0;
  const showFilePreview = !isNew || hasFile;
  const showMap = !isNew || mapSelected;

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (!file || !onFileAdd) return;
    onFileAdd({
      name: file.name,
      size: formatFileSize(file.size),
      desc: /\.(dwg|dxf)$/i.test(file.name) ? "узел / чертёж" : "план кровли",
      selected: true,
    });
    e.target.value = "";
  }

  function handleMapSearch() {
    const q = address.trim();
    if (!q || !onMapSelect) return;
    onMapSelect(q);
  }

  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
      {/* холст-просмотрщик */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--neutral-10)" }}>
        <SA.Tabs variant="segmented" value={tab}
          options={[{ id: "file", name: "Файл чертежа", icon: "file-text" }, { id: "map", name: "Адрес на карте", icon: "map-pin" }]}
          onChange={setTab} />
        {tab === "file" ? (
          <>
            {showFilePreview && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", background: "#fff", borderBottom: "1px solid var(--border-secondary-enabled)", margin: "0 20px", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)" }}>
                <ViewBtn icon="minus" onClick={() => setZoom((z) => Math.max(40, z - 20))} />
                <span style={{ fontSize: 13, fontWeight: 600, width: 48, textAlign: "center", color: "var(--content-secondary-enabled)" }}>{zoom}%</span>
                <ViewBtn icon="plus" onClick={() => setZoom((z) => Math.min(200, z + 20))} />
                <div style={{ width: 1, height: 22, background: "var(--border-secondary-enabled)", margin: "0 6px" }} />
                <ViewBtn icon="rotate-cw" onClick={() => setRot((r) => r + 90)} />
                <div style={{ flex: 1 }} />
                <SA.Button variant="white" icon="ruler" size="sm">Привязать масштаб{scale ? ` · ${scale}` : ""}</SA.Button>
              </div>
            )}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflow: "hidden" }}>
              {showFilePreview ? (
                <div style={{ background: "#fff", border: "1px solid var(--border-secondary-enabled)", boxShadow: "var(--shadow-small)", borderRadius: 4, padding: 18, transform: `scale(${zoom / 100}) rotate(${rot}deg)`, transition: "transform .25s" }}>
                  <div style={{ width: 560, height: 380, filter: "grayscale(1) opacity(.7)" }}>
                    <window.RoofCanvas layers={{ geometry: true, parapet: true, obstacles: true }} height="380px" />
                  </div>
                  <div style={{ marginTop: 10, fontFamily: "var(--font-family-mono, monospace)", fontSize: 11, color: "var(--content-tertiary-enabled)", textAlign: "center" }}>
                    {(files.find((f) => f.selected) || files[0])?.name || "Кровля_Север-2.pdf"} · лист 1 · план кровли
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", maxWidth: 320 }}>
                  <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: 999, background: "var(--neutral-15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <SA.Icon name="file-text" size={28} color="var(--neutral-40)" />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--content-secondary-enabled)", marginBottom: 6 }}>Чертёж не загружен</div>
                  <div style={{ fontSize: 13, color: "var(--content-tertiary-enabled)", lineHeight: 1.5 }}>Загрузите файл в панели справа — план кровли появится здесь</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", margin: 20, borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-secondary-enabled)", background: "repeating-linear-gradient(45deg, #eef0f4, #eef0f4 12px, #e7e9ef 12px, #e7e9ef 24px)" }}>
            {showMap && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 60% 45%, rgba(225,27,17,.10), transparent 40%)" }} />}
            {showMap && <SA.Icon name="map-pin" size={40} color="var(--red-60)" style={{ position: "absolute", top: "42%", left: "60%" }} />}
            <div style={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <SA.Input icon="search" placeholder="Введите адрес объекта" value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleMapSearch()} />
              </div>
              <SA.Button variant="accent" icon="map-pin" size="lg" onClick={handleMapSearch}>Указать на карте</SA.Button>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--neutral-55)" }}>
              {showMap ? "Яндекс.Карты · спутниковый снимок" : "Введите адрес и нажмите «Указать на карте»"}
            </div>
          </div>
        )}
      </div>

      {/* правая панель */}
      <div style={{ width: 380, flex: "0 0 380px", borderLeft: "1px solid var(--border-secondary-enabled)", background: "#fff", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {tab === "file" ? (
          <>
            <window.PanelHead title="Источник данных" />
            <div style={{ padding: "0 20px 16px" }}>
              <div
                role="button" tabIndex={0}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
                style={{ border: "1.5px dashed var(--border-secondary-enabled)", borderRadius: "var(--radius-lg)", padding: "22px 18px", textAlign: "center", background: "var(--neutral-10)", cursor: "pointer" }}>
                <input ref={fileRef} type="file" accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png" hidden onChange={handleFileInput} />
                <div style={{ width: 46, height: 46, margin: "0 auto 10px", borderRadius: 999, background: "var(--red-10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SA.Icon name="upload" size={22} color="var(--red-60)" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>Перетащите файл сюда</div>
                <div style={{ fontSize: 12.5, color: "var(--content-tertiary-enabled)", margin: "4px 0 12px" }}>PDF, DWG, DXF, JPG, PNG · до 100 МБ</div>
                <SA.Button variant="white" size="sm" icon="folder-open" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>Выбрать файл</SA.Button>
              </div>
            </div>
            {hasFile && (
              <>
                <window.PanelHead title="Загруженные файлы" count={files.length} />
                <div style={{ padding: "0 12px" }}>
                  {files.map((f, i) => (
                    <SA.Cell key={i} leftIcon="file-text" title={f.name} subtitle={`${f.size} · ${f.desc}`}
                      rightIcon={f.selected ? "check" : "ellipsis-vertical"} selected={f.selected} />
                  ))}
                </div>
              </>
            )}
            {scale && (
              <div style={{ margin: "12px 20px", padding: "14px 16px", background: "var(--blue-10)", borderRadius: "var(--radius-md)", display: "flex", gap: 10 }}>
                <SA.Icon name="info" size={18} color="var(--blue-60)" />
                <span style={{ fontSize: 12.5, color: "var(--blue-65)", lineHeight: 1.45 }}>Масштаб распознан по штампу чертежа: <b>{scale}</b>. При необходимости задайте вручную по известному размеру.</span>
              </div>
            )}
          </>
        ) : (
          <>
            <window.PanelHead title="Адрес объекта" />
            <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Адрес на карте">
                <SA.Input icon="map-pin" placeholder="г. Екатеринбург, ул. Примерная, 1" value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleMapSearch()} />
              </Field>
              <SA.Button variant="accent" icon="search" size="md" block onClick={handleMapSearch}>Найти на Яндекс.Картах</SA.Button>
              {mapSelected ? (
                <div style={{ padding: "12px 14px", background: "var(--green-10)", borderRadius: "var(--radius-md)", display: "flex", gap: 10 }}>
                  <SA.Icon name="circle-check" size={18} color="var(--green-55)" />
                  <span style={{ fontSize: 12.5, color: "var(--green-65)", lineHeight: 1.45 }}>Объект найден. Спутниковый снимок загружен — проверьте контур здания на карте.</span>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--content-tertiary-enabled)", lineHeight: 1.45 }}>Укажите адрес объекта — карта отобразит спутниковый снимок кровли для дальнейшей обводки контура.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--content-secondary-enabled)", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function ViewBtn({ icon, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-secondary-enabled)", borderRadius: 8, cursor: "pointer", background: h ? "var(--neutral-10)" : "#fff" }}>
      <SA.Icon name={icon} size={16} color="var(--content-secondary-enabled)" />
    </button>
  );
}

// ============ Шаг 2 — Геометрия и элементы (объединённый) ============
const GEO_ITEMS = [
  { icon: "spline", name: "Внешний контур кровли", val: "L-образный, 6 вершин", conf: 98 },
  { icon: "frame", name: "Парапет по периметру", val: "Высота 600 мм", conf: 95 },
  { icon: "layout-dashboard", name: "Внутренние зоны / уклоны", val: "4 ската к воронкам", conf: 90 },
  { icon: "move-diagonal", name: "Габариты в плане", val: "124,0 × 76,0 м", conf: 96 },
];

function StepRoof() {
  const D = window.SNOW_DATA;
  const [tab, setTab] = React.useState("geo");
  const [sel, setSel] = React.useState("shaft-1");
  const [underlay, setUnderlay] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [draw, setDraw] = React.useState(null);   // тип чертимого элемента
  const [edit, setEdit] = React.useState(false);  // режим правки габаритов
  const [picked, setPicked] = React.useState(null); // выбранный тип в диалоге добавления
  const list = D.OBSTACLES;
  const selObj = list.find((o) => o.id === sel);

  const pickType = (t) => { setDraw(t); setAddOpen(false); setPicked(null); };

  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
      {/* ХОЛСТ */}
      <div style={{ flex: 1, minWidth: 0, position: "relative", background: "var(--neutral-10)", display: "flex", cursor: draw ? "crosshair" : "default" }}>
        <window.RoofCanvas
          layers={{ geometry: true, parapet: true, obstacles: true, walkway: true, dims: true, parapetLabel: true, underlay, editHandles: true }}
          selectedId={sel} onSelect={(id) => { setSel(id); setEdit(false); }} />

        {/* переключатель подложки */}
        <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(255,255,255,.95)", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, boxShadow: "var(--shadow-small)" }}>
          <Toggle on={underlay} onClick={() => setUnderlay((v) => !v)} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>Подложка (оригинал)</span>
          {underlay && <span style={{ fontSize: 11.5, color: "var(--blue-65)" }}>· сравнение с чертежом</span>}
        </div>

        {/* баннер режима черчения */}
        {draw && (
          <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 12, background: "var(--red-60)", color: "#fff", borderRadius: "var(--radius-md)", padding: "10px 14px", boxShadow: "var(--shadow-large)" }}>
            <SA.Icon name="pen-line" size={18} color="#fff" />
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Режим черчения: обведите «{draw}» на плане кровли</span>
            <button type="button" onClick={() => setDraw(null)} style={{ border: "none", background: "rgba(255,255,255,.2)", color: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>Отмена</button>
          </div>
        )}
      </div>

      {/* ПАНЕЛЬ */}
      <div style={{ width: 400, flex: "0 0 400px", borderLeft: "1px solid var(--border-secondary-enabled)", background: "#fff", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <window.PanelHead title="Элементы кровли" count={list.length} />

        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
            <div style={{ margin: "0 20px 12px", padding: "10px 14px", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: 12 }}>
              <SA.Icon name="frame" size={18} color="var(--blue-60)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>Парапет по периметру</div>
                <div style={{ fontSize: 11.5, color: "var(--content-tertiary-enabled)" }}>Высота влияет на снеговые мешки</div>
              </div>
              <div style={{ width: 84 }}><SA.Input size="sm" defaultValue="600" /></div>
              <span style={{ fontSize: 12.5, color: "var(--content-tertiary-enabled)" }}>мм</span>
            </div>
            <div style={{ padding: "0 20px 12px" }}>
              <SA.Button variant="primary" icon="plus" size="md" block onClick={() => setAddOpen(true)}>Добавить элемент</SA.Button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
              {list.map((o) => (
                <SA.Cell key={o.id} selected={o.id === sel} onClick={() => { setSel(o.id); setEdit(false); }}
                  leftIcon={o.shape === "circle" ? "circle-dot" : "box"}
                  title={o.type}
                  subtitle={o.shape === "circle" ? "Точечный объект" : `${o.size} · h ${o.hM} м`}
                  rightIcon="chevron-right" />
              ))}
            </div>
            {selObj && selObj.shape !== "circle" && (
              <div style={{ padding: 18, borderTop: "1px solid var(--border-secondary-enabled)", background: "var(--neutral-10)" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>{selObj.type}</span>
                  <div style={{ flex: 1 }} />
                  <SA.Button variant={edit ? "secondary" : "white"} icon={edit ? "check" : "pen-line"} size="sm" onClick={() => setEdit((v) => !v)}>{edit ? "Применить" : "Габариты"}</SA.Button>
                  <SA.Button variant="white" icon="x" size="sm" aria-label="Закрыть" onClick={() => { setSel(null); setEdit(false); }} style={{ marginLeft: 8 }} />
                </div>
                {edit ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}><Field label="Ширина, м"><SA.Input size="sm" defaultValue={selObj.size.split(" × ")[0]} /></Field></div>
                      <div style={{ flex: 1 }}><Field label="Длина, м"><SA.Input size="sm" defaultValue={(selObj.size.split(" × ")[1] || "").replace(" м", "")} /></Field></div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}><Field label="Высота, м"><SA.Input size="sm" defaultValue={String(selObj.hM)} /></Field></div>
                      <div style={{ flex: 1 }}><Field label="Тип"><SA.Input size="sm" defaultValue={selObj.short} /></Field></div>
                    </div>
                    <span style={{ fontSize: 11.5, color: "var(--content-tertiary-enabled)" }}>Или потяните угловые маркеры элемента прямо на плане.</span>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: 13 }}>
                    <Prop k="Тип" v={selObj.short} />
                    <Prop k="Высота" v={`${selObj.hM} м`} />
                    <Prop k="Габариты" v={selObj.size} />
                    <Prop k="Координаты" v={`X ${Math.round(selObj.x / 6.6)}, Y ${Math.round(selObj.y / 6.6)} м`} />
                  </div>
                )}
              </div>
            )}
          </div>
        {addOpen && (
          <SA.Dialog title="Добавить элемент кровли" width={460}
            onClose={() => { setAddOpen(false); setPicked(null); }}
            footer={picked ? (
              <>
                <SA.Button variant="secondary" icon="arrow-left" onClick={() => setPicked(null)}>Назад</SA.Button>
                <SA.Button variant="accent" icon="pen-line" onClick={() => pickType(picked)}>Добавить на план</SA.Button>
              </>
            ) : null}>
            {!picked ? (
              <>
                <div style={{ fontSize: 13.5, color: "var(--content-tertiary-enabled)", marginBottom: 12 }}>Выберите тип элемента:</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {D.ELEMENT_TYPES.map((t) => (
                    <button key={t.id} type="button" onClick={() => setPicked(t.name)}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", border: "1px solid var(--border-secondary-enabled)", background: "#fff", padding: "12px 14px", borderRadius: "var(--radius-md)", cursor: "pointer", textAlign: "left" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-10)")} onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
                      <SA.Icon name={t.icon} size={18} color="var(--content-tertiary-enabled)" />
                      <span style={{ fontSize: 13.5, color: "var(--content-primary-a-enabled)" }}>{t.name}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: "var(--neutral-10)", display: "flex", alignItems: "center", justifyContent: "center" }}><SA.Icon name="box" size={20} color="var(--content-secondary-enabled)" /></div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>{picked}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--content-tertiary-enabled)", marginBottom: 12 }}>Укажите габариты элемента — затем обведите его на плане кровли.</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}><Field label="Ширина, м"><SA.Input size="sm" placeholder="0,0" /></Field></div>
                  <div style={{ flex: 1 }}><Field label="Длина, м"><SA.Input size="sm" placeholder="0,0" /></Field></div>
                  <div style={{ flex: 1 }}><Field label="Высота, м"><SA.Input size="sm" placeholder="0,0" /></Field></div>
                </div>
              </div>
            )}
          </SA.Dialog>
        )}
      </div>
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{ width: 38, height: 22, borderRadius: 999, border: "none", cursor: "pointer", padding: 2, background: on ? "var(--red-60)" : "var(--neutral-25)", transition: "background .15s" }}>
      <span style={{ display: "block", width: 18, height: 18, borderRadius: 999, background: "#fff", transform: on ? "translateX(16px)" : "translateX(0)", transition: "transform .15s" }} />
    </button>
  );
}

function Prop({ k, v }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--content-tertiary-enabled)" }}>{k}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>{v}</div>
    </div>
  );
}

Object.assign(window, { StepUpload, StepRoof });
