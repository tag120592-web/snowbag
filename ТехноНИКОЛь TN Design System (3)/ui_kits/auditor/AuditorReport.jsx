// Аудитор UI kit — report screen + per-type evidence + share dialog.
const { Icon, Card, Tag, Button, Avatar, Dialog, Input, Search } = window.TNDesignSystem_7f9df2;

// ---- affected page link row ----
function PageLink({ page, dead }) {
  return (
    <button type="button" style={{
      display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", width: "100%", textAlign: "left",
      border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", background: "#fff", cursor: "pointer",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--neutral-10)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}>
      <Icon name={dead ? "file-x" : "file-text"} size={17} color={dead ? "var(--content-system-negative)" : "var(--content-tertiary-enabled)"} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page.title}</span>
        <span style={{ display: "block", fontSize: 11.5, color: "var(--content-tertiary-enabled)" }}>{page.path}</span>
      </span>
      <Icon name="arrow-up-right" size={15} color="var(--content-tertiary-enabled)" />
    </button>
  );
}

// ---- Масштабируемый список затронутых статей (десятки–сотни) ----
function AffectedPages({ pages, label = "Затронутые статьи" }) {
  const [expanded, setExpanded] = React.useState(false);
  const [q, setQ] = React.useState("");
  const many = pages.length > 4;
  const filtered = q ? pages.filter((p) => (p.title + " " + p.path).toLowerCase().includes(q.toLowerCase())) : pages;
  const shown = expanded ? filtered : pages.slice(0, 4);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--content-tertiary-enabled)", textTransform: "uppercase", letterSpacing: ".03em" }}>{label}</span>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 20, height: 18, padding: "0 6px", background: "var(--background-secondary-a-enabled)", borderRadius: "var(--radius-pill)", fontSize: 11.5, fontWeight: 700, color: "var(--content-secondary-enabled)" }}>{pages.length}</span>
        <div style={{ flex: 1 }} />
        {many && (
          <button type="button" onClick={() => setExpanded((v) => !v)} style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "transparent", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--content-accent-enabled)", padding: 0 }}>
            {expanded ? "Свернуть" : `Показать все ${pages.length}`}
            <Icon name={expanded ? "chevron-up" : "chevron-down"} size={14} color="var(--content-accent-enabled)" />
          </button>
        )}
      </div>

      {expanded && pages.length > 8 && (
        <div style={{ marginBottom: 8 }}>
          <Search placeholder="Поиск по статьям" size="sm" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ("")} />
        </div>
      )}

      <div style={{
        display: "flex", flexDirection: "column", gap: 6,
        maxHeight: expanded ? 260 : "none", overflowY: expanded ? "auto" : "visible",
        paddingRight: expanded ? 4 : 0,
      }}>
        {shown.map((p, i) => <PageLink key={i} page={p} dead={p.dead} />)}
        {expanded && filtered.length === 0 && (
          <div style={{ fontSize: 13, color: "var(--content-tertiary-enabled)", padding: "8px 2px" }}>Ничего не найдено</div>
        )}
      </div>

      {!expanded && many && (
        <button type="button" onClick={() => setExpanded(true)} style={{ marginTop: 6, width: "100%", padding: "8px 10px", border: "1px dashed var(--border-secondary-hover)", borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--content-secondary-enabled)" }}>
          + ещё {pages.length - 4} {pages.length - 4 === 1 ? "статья" : "статей"}
        </button>
      )}
    </div>
  );
}

// ---- Один конкретный конфликт (пара/группа формулировок) ----
function ConflictItem({ conflict, index }) {
  return (
    <div style={{ border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--background-secondary-a-enabled)", borderBottom: "1px solid var(--border-secondary-enabled)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, background: "var(--red-10)", borderRadius: "var(--radius-pill)", fontSize: 11.5, fontWeight: 700, color: "var(--content-accent-enabled)" }}>{index}</span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>{conflict.topic}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {conflict.sides.map((s, i) => (
          <div key={i} style={{ padding: 12, borderLeft: i === 1 ? "1px solid var(--border-secondary-enabled)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
              <Icon name="file-text" size={14} color="var(--content-tertiary-enabled)" />
              <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 600, color: "var(--content-primary-a-enabled)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.article}</span>
            </div>
            <div style={{ fontSize: 13, lineHeight: "19px", color: "var(--neutral-85)", padding: "8px 10px", background: "var(--red-5)", borderLeft: "2px solid var(--red-40)", borderRadius: "4px", marginBottom: 6 }}>
              «{s.fragment}»
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--content-tertiary-enabled)" }}>
              <Icon name="clock" size={11} color="var(--content-tertiary-enabled)" />{s.path} · {s.updated}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConflictList({ conflicts }) {
  const [expanded, setExpanded] = React.useState(false);
  const shown = expanded ? conflicts : conflicts.slice(0, 2);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--content-tertiary-enabled)", textTransform: "uppercase", letterSpacing: ".03em" }}>Найденные противоречия</span>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 20, height: 18, padding: "0 6px", background: "var(--background-secondary-a-enabled)", borderRadius: "var(--radius-pill)", fontSize: 11.5, fontWeight: 700, color: "var(--content-secondary-enabled)" }}>{conflicts.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {shown.map((c, i) => <ConflictItem key={c.id || i} conflict={c} index={i + 1} />)}
      </div>
      {conflicts.length > 2 && (
        <button type="button" onClick={() => setExpanded((v) => !v)} style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "transparent", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--content-accent-enabled)", padding: 0 }}>
          {expanded ? "Свернуть" : `Показать ещё ${conflicts.length - 2}`}
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size={14} color="var(--content-accent-enabled)" />
        </button>
      )}
    </div>
  );
}

// ---- evidence: duplicate (группа похожих статей) ----
function SimilarityBar({ value }) {
  const tone = value >= 90 ? "var(--content-system-negative)" : value >= 80 ? "var(--content-system-warning)" : "var(--yellow-50)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 120px" }}>
      <div style={{ flex: 1, height: 6, background: "var(--background-tertiary-enabled)", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: tone, borderRadius: "999px" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--content-primary-a-enabled)", width: 38, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

function EvidenceDuplicate({ ev }) {
  const [expanded, setExpanded] = React.useState(false);
  const arts = ev.articles;
  const shown = expanded ? arts : arts.slice(0, 3);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* общий повторяющийся фрагмент */}
      {ev.overlap && (
        <div style={{ padding: "10px 12px", background: "var(--orange-10)", borderLeft: "2px solid var(--content-system-warning)", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Icon name="copy" size={14} color="var(--orange-65)" />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--orange-65)", textTransform: "uppercase", letterSpacing: ".03em" }}>Повторяющийся фрагмент</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: "19px", color: "var(--neutral-85)" }}>«{ev.overlap}»</div>
        </div>
      )}

      {/* группа статей */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--content-tertiary-enabled)", textTransform: "uppercase", letterSpacing: ".03em" }}>Похожие статьи</span>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 20, height: 18, padding: "0 6px", background: "var(--background-secondary-a-enabled)", borderRadius: "var(--radius-pill)", fontSize: 11.5, fontWeight: 700, color: "var(--content-secondary-enabled)" }}>{arts.length}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {shown.map((p, i) => (
            <button key={i} type="button" style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", textAlign: "left", width: "100%",
              border: `1px solid ${p.primary ? "var(--border-primary-a-enabled)" : "var(--border-secondary-enabled)"}`,
              borderRadius: "var(--radius-md)", background: "#fff", cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--neutral-10)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}>
              <Icon name="file-text" size={17} color="var(--content-tertiary-enabled)" />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                  {p.primary && <Tag tone="green" size="sm">эталон</Tag>}
                </span>
                <span style={{ display: "block", fontSize: 11.5, color: "var(--content-tertiary-enabled)", marginTop: 1 }}>{p.path} · {p.updated}</span>
              </span>
              <SimilarityBar value={p.similarity} />
              <Icon name="arrow-up-right" size={15} color="var(--content-tertiary-enabled)" />
            </button>
          ))}
        </div>
        {arts.length > 3 && (
          <button type="button" onClick={() => setExpanded((v) => !v)} style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "transparent", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--content-accent-enabled)", padding: 0 }}>
            {expanded ? "Свернуть" : `Показать ещё ${arts.length - 3}`}
            <Icon name={expanded ? "chevron-up" : "chevron-down"} size={14} color="var(--content-accent-enabled)" />
          </button>
        )}
      </div>
    </div>
  );
}

// ---- источники одной ссылки (где встречается) ----
function LinkSources({ sources }) {
  const [expanded, setExpanded] = React.useState(false);
  const shown = expanded ? sources : sources.slice(0, 2);
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--content-tertiary-enabled)", marginBottom: 6 }}>
        Встречается в {sources.length} {sources.length === 1 ? "статье" : "статьях"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {shown.map((s, i) => <PageLink key={i} page={s} />)}
      </div>
      {sources.length > 2 && (
        <button type="button" onClick={() => setExpanded((v) => !v)} style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "transparent", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--content-accent-enabled)", padding: 0 }}>
          {expanded ? "Свернуть" : `Показать ещё ${sources.length - 2}`}
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size={14} color="var(--content-accent-enabled)" />
        </button>
      )}
    </div>
  );
}

// ---- evidence: broken links (группа мёртвых ссылок) ----
function EvidenceBroken({ ev }) {
  const links = ev.links;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--content-tertiary-enabled)", textTransform: "uppercase", letterSpacing: ".03em" }}>Мёртвые ссылки</span>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 20, height: 18, padding: "0 6px", background: "var(--background-secondary-a-enabled)", borderRadius: "var(--radius-pill)", fontSize: 11.5, fontWeight: 700, color: "var(--content-secondary-enabled)" }}>{links.length}</span>
      </div>
      {links.map((l, i) => (
        <div key={i} style={{ border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <div style={{ padding: "10px 12px", background: "var(--red-5)", borderBottom: "1px solid var(--border-secondary-enabled)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Icon name="unlink" size={16} color="var(--content-system-negative)" />
              <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>{l.target}</span>
              <Tag tone="red" size="sm">{l.status}</Tag>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 24 }}>
              <code style={{ fontFamily: "var(--font-family-mono)", fontSize: 12, color: "var(--content-system-negative)", textDecoration: "line-through" }}>{l.url}</code>
              <span style={{ fontSize: 11, color: "var(--content-tertiary-enabled)" }}>· проверено {l.checked}</span>
            </div>
          </div>
          <div style={{ padding: 12 }}>
            <LinkSources sources={l.sources} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- evidence: ownerless ----
function EvidenceOwnerless({ ev }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <PageLink page={ev.page} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", background: "var(--background-secondary-a-enabled)" }}>
        <Avatar text={ev.owner.initials} size="sm" status="gray" />
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>{ev.owner.name}</span>
          <span style={{ display: "block", fontSize: 11.5, color: "var(--content-tertiary-enabled)" }}>владелец статьи</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--content-system-negative)", fontWeight: 500 }}>
          <Icon name="user-x" size={15} color="var(--content-system-negative)" />
          последний вход {ev.owner.lastLogin} · {ev.owner.ago}
        </span>
      </div>
    </div>
  );
}

function Evidence({ finding }) {
  if (finding.type === "duplicate") return <EvidenceDuplicate ev={finding.evidence} />;
  if (finding.type === "broken") return <EvidenceBroken ev={finding.evidence} />;
  if (finding.type === "ownerless") return <EvidenceOwnerless ev={finding.evidence} />;
  return null;
}

function ProblemCard({ finding }) {
  const { SEVERITY, PTYPE } = window.AUDITOR_DATA;
  const sev = SEVERITY[finding.severity];
  const t = PTYPE[finding.type];
  const isContradiction = finding.type === "contradiction";
  return (
    <Card padding="none" style={{ overflow: "hidden" }}>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Tag tone={sev.tone} size="md">{sev.label}</Tag>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 10px", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 500, color: "var(--content-secondary-enabled)" }}>
            <Icon name={t.icon} size={15} color="var(--content-secondary-enabled)" />{t.label}
          </span>
        </div>

        {/* title */}
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--content-primary-a-enabled)", lineHeight: "22px" }}>{finding.title}</div>

        {/* core evidence */}
        {isContradiction ? (
          <ConflictList conflicts={finding.conflicts} />
        ) : (
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--content-tertiary-enabled)", textTransform: "uppercase", letterSpacing: ".03em", marginBottom: 8 }}>Доказательство</div>
            <Evidence finding={finding} />
          </div>
        )}

        {/* affected pages — scalable */}
        {isContradiction && <AffectedPages pages={finding.pages} />}

        {/* basis — explainability */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "8px 10px", background: "var(--background-secondary-a-enabled)", borderRadius: "var(--radius-md)" }}>
          <Icon name="info" size={15} color="var(--content-tertiary-enabled)" style={{ marginTop: 1 }} />
          <span style={{ fontSize: 12.5, lineHeight: "17px", color: "var(--content-secondary-enabled)" }}><b style={{ color: "var(--content-primary-a-enabled)" }}>Основание:</b> {finding.basis}</span>
        </div>
      </div>
    </Card>
  );
}

function SummaryChips({ findings }) {
  const { PTYPE, pluralRu } = window.AUDITOR_DATA;
  const byType = {};
  findings.forEach((f) => { byType[f.type] = (byType[f.type] || 0) + 1; });
  const order = ["contradiction", "duplicate", "broken", "ownerless"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {order.filter((k) => byType[k]).map((k) => (
        <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", background: "#fff", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-pill)", fontSize: 13, fontWeight: 600, color: "var(--content-primary-a-enabled)" }}>
          <Icon name={PTYPE[k].icon} size={15} color="var(--content-secondary-enabled)" />
          {byType[k]} {pluralRu(byType[k], PTYPE[k].forms)}
        </span>
      ))}
    </div>
  );
}

function ShareDialog({ open, onClose }) {
  const [copied, setCopied] = React.useState(false);
  if (!open) return null;
  return (
    <Dialog title="Поделиться отчётом" width={440} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Готово</Button></>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--background-secondary-a-enabled)", borderRadius: "var(--radius-md)" }}>
          <Icon name="shield-check" size={20} color="var(--content-system-positive)" />
          <span style={{ fontSize: 13, lineHeight: "18px", color: "var(--content-secondary-enabled)" }}>Ссылка защищена. Доступна только сотрудникам ТехноНИКОЛь после входа — получатель видит отчёт в пределах своих прав доступа.</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <Input label="Ссылка на отчёт" value="https://app.tn.ru/kb/auditor/r/8f3ac1" readOnly icon="link" />
          </div>
          <Button variant={copied ? "secondary" : "accent"} icon={copied ? "check" : "copy"} onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }} style={{ marginBottom: 0 }}>
            {copied ? "Готово" : "Копировать"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function TypeTile({ typeKey, findings, active, onClick }) {
  const { PTYPE, SEVERITY } = window.AUDITOR_DATA;
  const t = PTYPE[typeKey];
  const items = findings.filter((f) => f.type === typeKey);
  const count = items.length;
  const worst = items.reduce((acc, f) => (SEVERITY[f.severity].order < acc ? SEVERITY[f.severity].order : acc), 9);
  const worstKey = Object.keys(SEVERITY).find((k) => SEVERITY[k].order === worst);
  const tone = count ? SEVERITY[worstKey].tone : "neutral";
  const toneColor = {
    red: "var(--content-system-negative)", orange: "var(--content-system-warning)",
    yellow: "var(--yellow-50)", neutral: "var(--content-tertiary-enabled)",
  }[tone];
  const toneBg = {
    red: "var(--red-10)", orange: "var(--orange-10)", yellow: "var(--yellow-10)", neutral: "var(--background-secondary-a-enabled)",
  }[tone];
  const [hover, setHover] = React.useState(false);

  return (
    <button type="button" onClick={() => onClick(typeKey)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: "column", gap: 10, padding: 16, textAlign: "left", cursor: "pointer",
        background: "#fff",
        border: `1.5px solid ${active ? "var(--border-primary-a-enabled)" : "var(--border-secondary-enabled)"}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: active || hover ? "var(--shadow-small)" : "none",
        transition: "border-color .15s, box-shadow .15s",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 40, height: 40, flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", background: toneBg, borderRadius: "var(--radius-md)" }}>
          <Icon name={t.icon} size={21} color={toneColor} />
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 30, fontWeight: 800, color: "var(--content-primary-a-enabled)", lineHeight: 1 }}>{count}</span>
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>{t.title}</div>
        <div style={{ fontSize: 13, color: "var(--content-secondary-enabled)", marginTop: 2 }}>{t.desc}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 6, borderTop: "1px solid var(--border-secondary-enabled)" }}>
        {count ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, color: toneColor }}>
            <span style={{ width: 7, height: 7, borderRadius: "999px", background: toneColor }} />
            до «{SEVERITY[worstKey].label.toLowerCase()}»
          </span>
        ) : (
          <span style={{ fontSize: 12.5, color: "var(--content-tertiary-enabled)" }}>нет проблем</span>
        )}
        <span style={{ flex: 1 }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 600, color: active ? "var(--content-accent-enabled)" : "var(--content-tertiary-enabled)" }}>
          Подробнее <Icon name="arrow-right" size={14} color={active ? "var(--content-accent-enabled)" : "var(--content-tertiary-enabled)"} />
        </span>
      </div>
    </button>
  );
}

function AuditorReport({ query, onNewQuery, onDashboard }) {
  const { FINDINGS, SEVERITY, PTYPE, pluralRu } = window.AUDITOR_DATA;
  const [share, setShare] = React.useState(false);
  const [filter, setFilter] = React.useState(null); // null = все
  const listRef = React.useRef(null);
  const sorted = [...FINDINGS].sort((a, b) => SEVERITY[a.severity].order - SEVERITY[b.severity].order);
  const visible = filter ? sorted.filter((f) => f.type === filter) : sorted;
  const order = ["contradiction", "duplicate", "broken", "ownerless"];

  const pickType = (typeKey) => {
    setFilter((cur) => (cur === typeKey ? null : typeKey));
    setTimeout(() => {
      const el = listRef.current;
      if (!el) return;
      let sc = el.parentElement;
      while (sc && sc.scrollHeight <= sc.clientHeight) sc = sc.parentElement;
      if (sc) sc.scrollTo({ top: sc.scrollTop + el.getBoundingClientRect().top - sc.getBoundingClientRect().top - 12, behavior: "smooth" });
    }, 60);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--neutral-10)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 24px 56px" }}>
        {/* query echo */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--red-10)", borderRadius: "var(--radius-pill)" }}>
            <Icon name="shield-check" size={18} color="var(--content-accent-enabled)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>{query}</div>
            <div style={{ fontSize: 12.5, color: "var(--content-tertiary-enabled)", marginTop: 2 }}>Найдено 10 статей</div>
          </div>
          <Button variant="link" icon="arrow-left" onClick={onNewQuery}>Новый запрос</Button>
        </div>

        {/* PRIMARY: показатели по типам */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>Итоги проверки</span>
          <span style={{ fontSize: 13.5, color: "var(--content-secondary-enabled)" }}>· {FINDINGS.length} {pluralRu(FINDINGS.length, ["проблема", "проблемы", "проблем"])} в 7 статьях</span>
          <div style={{ flex: 1 }} />
          {onDashboard && <Button variant="link" icon="gauge" onClick={onDashboard}>Дашборд качества</Button>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {order.map((k) => (
            <TypeTile key={k} typeKey={k} findings={FINDINGS} active={filter === k} onClick={pickType} />
          ))}
        </div>

        {/* problem list */}
        <div ref={listRef} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, scrollMarginTop: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--content-primary-a-enabled)" }}>
            {filter ? PTYPE[filter].title : "Все проблемы"}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 22, height: 22, padding: "0 7px", background: "var(--background-secondary-a-enabled)", borderRadius: "var(--radius-pill)", fontSize: 12.5, fontWeight: 700, color: "var(--content-secondary-enabled)" }}>{visible.length}</span>
          <div style={{ flex: 1 }} />
          {filter && <Button variant="white" size="sm" icon="x" onClick={() => setFilter(null)}>Показать все</Button>}
          <Button variant="primary" size="sm" icon="share-2" onClick={() => setShare(true)}>Поделиться</Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {visible.map((f) => <ProblemCard key={f.id} finding={f} />)}
        </div>
      </div>
      <ShareDialog open={share} onClose={() => setShare(false)} />
    </div>
  );
}

Object.assign(window, { AuditorReport });
