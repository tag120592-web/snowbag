// «Снеговые мешки» — центральный SVG-план кровли с послойным раскрытием.
// Слои управляются пропом layers; послойно используется на шагах 2–7.
const SnowIcon = window.__lazyTN("Icon");

const RISK_META = {
  critical: { fill: "var(--red-60)", soft: "var(--red-10)", line: "var(--red-65)", label: "Критическая", tone: "red" },
  high: { fill: "var(--orange-40)", soft: "var(--orange-10)", line: "var(--orange-50)", label: "Высокая", tone: "orange" },
  medium: { fill: "var(--yellow-30)", soft: "var(--yellow-10)", line: "var(--yellow-40)", label: "Средняя", tone: "yellow" },
};

function ptsStr(pts) { return pts.map((p) => p.join(",")).join(" "); }
function centroid(pts) {
  const n = pts.length;
  return [pts.reduce((a, p) => a + p[0], 0) / n, pts.reduce((a, p) => a + p[1], 0) / n];
}
function shrink(pts, t) {
  const c = centroid(pts);
  return pts.map((p) => [c[0] + (p[0] - c[0]) * (1 - t), c[1] + (p[1] - c[1]) * (1 - t)]);
}

// ---------- Роза ветров ----------
function WindRose({ size = 150, data = window.SNOW_DATA.WINDROSE, north = 0 }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 18;
  const max = Math.max(...data.map((d) => d.v));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <g transform={`rotate(${north} ${cx} ${cy})`}>
        {[0.5, 1].map((f, i) => (
          <circle key={i} cx={cx} cy={cy} r={R * f} fill="none" stroke="var(--neutral-20)" strokeWidth="1" strokeDasharray={i === 0 ? "3 3" : "0"} />
        ))}
        {data.map((d) => {
          const rad = (d.deg - 90) * Math.PI / 180;
          const len = (d.v / max) * R;
          const x = cx + Math.cos(rad) * len, y = cy + Math.sin(rad) * len;
          const w = 7;
          const px = cx + Math.cos(rad + Math.PI / 2) * w, py = cy + Math.sin(rad + Math.PI / 2) * w;
          const qx = cx + Math.cos(rad - Math.PI / 2) * w, qy = cy + Math.sin(rad - Math.PI / 2) * w;
          const strong = d.v === max;
          return <polygon key={d.dir} points={`${cx},${cy} ${px},${py} ${x},${y} ${qx},${qy}`}
            fill={strong ? "var(--red-60)" : "var(--blue-40)"} fillOpacity={strong ? 0.9 : 0.55} />;
        })}
      </g>
      {/* стороны света — без поворота, подписи фиксированы к географии */}
      {[["С", 0], ["В", 90], ["Ю", 180], ["З", 270]].map(([lab, deg]) => {
        const rad = (deg - 90 + north) * Math.PI / 180;
        const r = R + 11;
        return <text key={lab} x={cx + Math.cos(rad) * r} y={cy + Math.sin(rad) * r + 4}
          textAnchor="middle" fontSize="11" fontWeight={lab === "С" ? 800 : 600}
          fill={lab === "С" ? "var(--red-60)" : "var(--content-tertiary-enabled)"}>{lab}</text>;
      })}
    </svg>
  );
}

// ---------- Компас (стрелка севера) ----------
function NorthArrow({ size = 56, deg = 0 }) {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle cx={c} cy={c} r={c - 2} fill="#fff" stroke="var(--border-secondary-enabled)" strokeWidth="1" />
      <g transform={`rotate(${deg} ${c} ${c})`}>
        <polygon points={`${c},${c - (c - 9)} ${c - 6},${c + 4} ${c + 6},${c + 4}`} fill="var(--red-60)" />
        <polygon points={`${c},${c + (c - 12)} ${c - 5},${c + 2} ${c + 5},${c + 2}`} fill="var(--neutral-35)" />
      </g>
      <text x={c} y="13" textAnchor="middle" fontSize="9" fontWeight="800" fill="var(--content-primary-a-enabled)">С</text>
    </svg>
  );
}

const PX_PER_M = 6.6;
function meters(px) { return (Math.abs(px) / PX_PER_M).toFixed(1).replace(".", ",") + " м"; }

function DistLabel({ x, y, t, tone = "var(--red-65)" }) {
  const w = t.length * 6.6 + 12;
  return (
    <g>
      <rect x={x - w / 2} y={y - 9} width={w} height={18} rx="4" fill="#fff" stroke={tone} strokeWidth="1" opacity="0.96" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={tone}>{t}</text>
    </g>
  );
}

// ---------- План кровли ----------
function RoofCanvas({ layers = {}, selectedId = null, onSelect, view3d = false, height = "100%" }) {
  const D = window.SNOW_DATA;
  const L = { geometry: true, parapet: true, walkway: false, obstacles: false, bags: false, sensors: false, dims: false, north: false, wind: false, underlay: false, editHandles: false, sensorDims: false, parapetLabel: false, ...layers };
  const sel = (id) => onSelect && onSelect(id);

  return (
    <div style={{ width: "100%", height, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", perspective: view3d ? "1500px" : "none" }}>
      <svg viewBox="0 0 1000 680" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
        style={{
          maxHeight: "100%", transition: "transform .45s ease",
          transform: view3d ? "rotateX(56deg) rotateZ(-20deg) scale(.92)" : "none",
          transformOrigin: "center 62%",
          filter: view3d ? "drop-shadow(0 40px 30px rgba(20,24,38,.22))" : "none",
        }}>
        <defs>
          <pattern id="snowGrid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M34 0H0V34" fill="none" stroke="var(--neutral-15)" strokeWidth="1" />
          </pattern>
          {Object.keys(RISK_META).map((r) => (
            <radialGradient key={r} id={`baggrad-${r}`} cx="50%" cy="50%" r="62%">
              <stop offset="0%" stopColor={RISK_META[r].fill} stopOpacity="0.62" />
              <stop offset="55%" stopColor={RISK_META[r].fill} stopOpacity="0.34" />
              <stop offset="100%" stopColor={RISK_META[r].fill} stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id="bagblur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <clipPath id="roofclip"><polygon points={ptsStr(D.ROOF)} /></clipPath>
        </defs>

        {/* фон-сетка */}
        <rect x="0" y="0" width="1000" height="680" fill="var(--neutral-10)" />

        {/* ---------- Подложка: оригинальный чертёж под распознанным ---------- */}
        {L.underlay && (
          <g transform="translate(8 10) rotate(0.7 500 340)" opacity="0.55">
            <polygon points={ptsStr(D.ROOF)} fill="none" stroke="var(--blue-55)" strokeWidth="1.5" strokeDasharray="7 5" />
            {D.OBSTACLES.filter((o) => o.shape !== "circle").map((o) => (
              <rect key={o.id} x={o.x} y={o.y} width={o.w} height={o.h} fill="none" stroke="var(--blue-55)" strokeWidth="1.2" strokeDasharray="5 4" />
            ))}
          </g>
        )}

        {/* ---------- Контур кровли ---------- */}
        {L.geometry && (
          <g>
            <polygon points={ptsStr(D.ROOF)} fill="#ffffff" />
            <polygon points={ptsStr(D.ROOF)} fill="url(#snowGrid)" />
            <polygon points={ptsStr(D.ROOF)} fill="none" stroke="var(--content-primary-a-enabled)" strokeWidth="2.5" strokeLinejoin="round" />
            {L.parapet && (
              <polygon points={ptsStr(D.ROOF)} fill="none" stroke="var(--neutral-45)" strokeWidth="7" strokeOpacity="0.35" strokeLinejoin="round" />
            )}
            {L.parapet && L.parapetLabel && (
              <g fill="var(--blue-65)" fontSize="11.5" fontWeight="700">
                <rect x={418} y={74} width={164} height={18} rx="4" fill="#fff" stroke="var(--blue-40)" opacity="0.95" />
                <text x={500} y={87} textAnchor="middle">Парапет · h 600 мм</text>
              </g>
            )}
          </g>
        )}

        {/* ---------- Снеговые мешки (плавная тепловая карта) ---------- */}
        {L.bags && (
          <g>
            <g clipPath="url(#roofclip)">
              {D.SNOWBAGS.map((z) => (
                <polygon key={z.id + "-f"} points={ptsStr(z.poly)} fill={`url(#baggrad-${z.risk})`} filter="url(#bagblur)" />
              ))}
            </g>
            {D.SNOWBAGS.map((z) => {
              const m = RISK_META[z.risk];
              const on = selectedId === z.id;
              return (
                <g key={z.id} style={{ cursor: onSelect ? "pointer" : "default" }} onClick={() => sel(z.id)}>
                  <polygon points={ptsStr(z.poly)} fill="transparent" stroke={m.line}
                    strokeWidth={on ? 2.5 : 1.1} strokeDasharray="5 4" strokeOpacity={on ? 0.95 : 0.45} />
                  {!view3d && (
                    <text x={centroid(z.poly)[0]} y={centroid(z.poly)[1] + 4} textAnchor="middle"
                      fontSize="13" fontWeight="800" fill={m.line}>{z.id}</text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* ---------- Пешеходная дорожка ---------- */}
        {L.walkway && (
          <polyline points={ptsStr(D.WALKWAY)} fill="none" stroke="var(--blue-40)"
            strokeWidth="6" strokeDasharray="2 8" strokeLinecap="round" strokeOpacity="0.7" />
        )}

        {/* ---------- Препятствия ---------- */}
        {L.obstacles && D.OBSTACLES.map((o) => {
          const on = selectedId === o.id;
          if (o.shape === "circle") {
            return (
              <g key={o.id} style={{ cursor: onSelect ? "pointer" : "default" }} onClick={() => sel(o.id)}>
                <circle cx={o.cx} cy={o.cy} r={o.r} fill="#fff" stroke="var(--blue-55)" strokeWidth={on ? 3 : 2} />
                <circle cx={o.cx} cy={o.cy} r={o.r - 4} fill="var(--blue-40)" fillOpacity="0.5" />
              </g>
            );
          }
          return (
            <g key={o.id} style={{ cursor: onSelect ? "pointer" : "default" }} onClick={() => sel(o.id)}>
              <rect x={o.x} y={o.y} width={o.w} height={o.h} rx="3"
                fill={on ? "var(--neutral-20)" : "var(--neutral-15)"}
                stroke={on ? "var(--content-primary-a-enabled)" : "var(--neutral-45)"} strokeWidth={on ? 2.5 : 1.5} />
              <line x1={o.x} y1={o.y} x2={o.x + o.w} y2={o.y + o.h} stroke="var(--neutral-35)" strokeWidth="1" />
              <line x1={o.x + o.w} y1={o.y} x2={o.x} y2={o.y + o.h} stroke="var(--neutral-35)" strokeWidth="1" />
              {!view3d && (
                <text x={o.x + o.w / 2} y={o.y + o.h / 2 + 4} textAnchor="middle" fontSize="11"
                  fontWeight="600" fill="var(--content-secondary-enabled)">{o.short}</text>
              )}
              {/* ручки изменения габаритов выделенного элемента */}
              {on && L.editHandles && !view3d && [[o.x, o.y], [o.x + o.w, o.y], [o.x, o.y + o.h], [o.x + o.w, o.y + o.h]].map((p, i) => (
                <rect key={i} x={p[0] - 4.5} y={p[1] - 4.5} width="9" height="9" fill="#fff" stroke="var(--red-60)" strokeWidth="2" style={{ cursor: "nwse-resize" }} />
              ))}
              {on && L.editHandles && !view3d && (
                <>
                  <DimLine x1={o.x} y1={o.y - 16} x2={o.x + o.w} y2={o.y - 16} label={meters(o.w)} />
                  <DimLine x1={o.x - 16} y1={o.y} x2={o.x - 16} y2={o.y + o.h} label={meters(o.h)} vertical />
                </>
              )}
            </g>
          );
        })}

        {/* ---------- Размеры при перемещении выбранного датчика ---------- */}
        {L.sensorDims && (() => {
          const s = D.SENSORS.find((x) => x.id === selectedId);
          if (!s) return null;
          const bottomY = s.x < 560 ? 590 : 440;
          let best = null, bd = 1e9;
          D.OBSTACLES.forEach((o) => {
            const cx = o.shape === "circle" ? o.cx : o.x + o.w / 2;
            const cy = o.shape === "circle" ? o.cy : o.y + o.h / 2;
            const d = Math.hypot(cx - s.x, cy - s.y);
            if (d < bd) { bd = d; best = { cx, cy }; }
          });
          return (
            <g>
              <line x1={90} y1={s.y} x2={s.x} y2={s.y} stroke="var(--red-60)" strokeWidth="1.2" strokeDasharray="4 3" />
              <DistLabel x={(90 + s.x) / 2} y={s.y - 12} t={meters(s.x - 90)} />
              <line x1={s.x} y1={s.y} x2={s.x} y2={bottomY} stroke="var(--red-60)" strokeWidth="1.2" strokeDasharray="4 3" />
              <DistLabel x={s.x} y={(s.y + bottomY) / 2} t={meters(bottomY - s.y)} />
              {best && (
                <>
                  <line x1={s.x} y1={s.y} x2={best.cx} y2={best.cy} stroke="var(--blue-55)" strokeWidth="1.2" strokeDasharray="4 3" />
                  <DistLabel x={(s.x + best.cx) / 2} y={(s.y + best.cy) / 2} t={meters(bd)} tone="var(--blue-60)" />
                </>
              )}
            </g>
          );
        })()}

        {/* ---------- Датчики ---------- */}
        {L.sensors && D.SENSORS.map((s) => {
          const on = selectedId === s.id;
          return (
            <g key={s.id} style={{ cursor: onSelect ? "pointer" : "default" }} onClick={() => sel(s.id)}>
              {on && <circle cx={s.x} cy={s.y} r="16" fill="var(--red-60)" fillOpacity="0.15" />}
              <circle cx={s.x} cy={s.y} r="9" fill="var(--red-60)" stroke="#fff" strokeWidth="2.5" />
              <circle cx={s.x} cy={s.y} r="3" fill="#fff" />
            </g>
          );
        })}

        {/* ---------- Размеры ---------- */}
        {L.dims && (
          <g fontSize="12" fontWeight="600" fill="var(--content-tertiary-enabled)">
            <DimLine x1={90} y1={64} x2={910} y2={64} label="124,0 м" />
            <DimLine x1={64} y1={90} x2={64} y2={590} label="76,0 м" vertical />
            <DimLine x1={560} y1={616} x2={910} y2={616} label="53,0 м" flip />
          </g>
        )}

        {/* ---------- Компас + роза ветров на схеме ---------- */}
        {L.north && (
          <g transform="translate(866, 142)">
            <foreignObject x="-40" y="-40" width="120" height="120">
              <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: 120, height: 120 }}>
                <WindRose size={120} north={D.CLIMATE.northDeg} />
              </div>
            </foreignObject>
          </g>
        )}
      </svg>
    </div>
  );
}

function DimLine({ x1, y1, x2, y2, label, vertical, flip }) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <g stroke="var(--neutral-45)" strokeWidth="1">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <line x1={x1} y1={vertical ? y1 : y1 - 5} x2={x1} y2={vertical ? y1 : y1 + 5} />
      <line x1={x2} y1={vertical ? y2 : y2 - 5} x2={x2} y2={vertical ? y2 : y2 + 5} />
      {vertical
        ? <text x={x1 - 6} y={my} textAnchor="middle" stroke="none" transform={`rotate(-90 ${x1 - 6} ${my})`}>{label}</text>
        : <text x={mx} y={flip ? y1 + 16 : y1 - 6} textAnchor="middle" stroke="none">{label}</text>}
    </g>
  );
}

Object.assign(window, { RoofCanvas, WindRose, NorthArrow, RISK_META });
