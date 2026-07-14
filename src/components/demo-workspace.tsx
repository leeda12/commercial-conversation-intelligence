"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Copy,
  DatabaseZap,
  Download,
  FileJson2,
  FileSpreadsheet,
  Mail,
  MessageSquareQuote,
  RefreshCcw,
  RotateCcw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  UserRoundCheck,
  UsersRound,
  WandSparkles,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { precomputedConversationAnalyzer } from "@/src/analyzers/precomputed-conversation-analyzer";
import { scenarios } from "@/src/demo-data/scenarios";
import {
  buildCrmCsv,
  buildEmailExport,
  buildJsonExport,
  buildTaskCsv,
  downloadText,
} from "@/src/exports/exporters";
import type { ConversationAnalysis, Evidence } from "@/src/domain/types";

type Tab = "brief" | "crm" | "follow-up" | "evidence";
type Value = string | number | null;

const stageLabels: Record<string, string> = {
  discovery: "Discovery",
  qualification: "Qualification",
  evaluation: "Evaluation",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed won",
  closed_lost: "Closed lost",
  unknown: "Unknown",
};

const formatDate = (value: string | null) => {
  if (!value) return "Not confirmed";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
};

const titleCase = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function setAtPath<T>(source: T, path: string, value: unknown): T {
  const clone = structuredClone(source) as Record<string, unknown>;
  const segments = path.split("/").filter(Boolean);
  let cursor: Record<string, unknown> | unknown[] = clone;
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      if (Array.isArray(cursor)) cursor[Number(segment)] = value;
      else cursor[segment] = value;
      return;
    }
    if (Array.isArray(cursor)) {
      if (cursor[Number(segment)] == null) cursor[Number(segment)] = {};
      cursor = cursor[Number(segment)] as Record<string, unknown> | unknown[];
    } else {
      if (cursor[segment] == null) cursor[segment] = {};
      cursor = cursor[segment] as Record<string, unknown> | unknown[];
    }
  });
  return clone as T;
}

function Field({
  label,
  path,
  edited,
  evidence,
  onEvidence,
  children,
  wide = false,
}: {
  label: string;
  path: string;
  edited: boolean;
  evidence?: Evidence;
  onEvidence?: (item: Evidence) => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`field ${wide ? "field--wide" : ""}`} data-field-path={path}>
      <div className="field__head">
        <label htmlFor={path}>{label}</label>
        <span className="field__actions">
          {edited && <span className="edited-mark"><Check size={11} /> Edited</span>}
          {evidence && onEvidence && (
            <button className="evidence-link" type="button" onClick={() => onEvidence(evidence)} aria-label={`View evidence for ${label}`}>
              <MessageSquareQuote size={13} /> Evidence
            </button>
          )}
        </span>
      </div>
      {children}
    </div>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "positive" | "warning" | "info" }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function DemoWorkspace() {
  const [selectedId, setSelectedId] = useState(scenarios[0].transcript.transcript_id);
  const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null);
  const [editedPaths, setEditedPaths] = useState<string[]>([]);
  const [reviewStatus, setReviewStatus] = useState<"unreviewed" | "in_review" | "reviewed">("unreviewed");
  const [activeTab, setActiveTab] = useState<Tab>("brief");
  const [activeEvidenceId, setActiveEvidenceId] = useState<string | null>(null);
  const [activeTurnId, setActiveTurnId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState("Select a fictional call, then load its precomputed analysis.");
  const transcriptPanel = useRef<HTMLElement>(null);

  const selected = scenarios.find((item) => item.transcript.transcript_id === selectedId) ?? scenarios[0];
  const evidenceByPath = useMemo(() => new Map(analysis?.quality.evidence.map((item) => [item.field_path, item]) ?? []), [analysis]);

  const chooseScenario = (id: string) => {
    if (editedPaths.length && !window.confirm("Switch scenarios and discard the current in-memory edits?")) return;
    setSelectedId(id);
    setAnalysis(null);
    setEditedPaths([]);
    setReviewStatus("unreviewed");
    setActiveEvidenceId(null);
    setActiveTurnId(null);
    setNotice("Scenario selected. Load its deterministic precomputed analysis when ready.");
  };

  const loadAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await precomputedConversationAnalyzer.analyze({ transcript_id: selectedId });
      setAnalysis(result);
      setEditedPaths([]);
      setReviewStatus("unreviewed");
      setActiveTab("brief");
      setNotice("Precomputed fictional analysis loaded. No live AI or external service was used.");
    } finally {
      setIsLoading(false);
    }
  };

  const update = (path: string, value: unknown) => {
    if (!analysis) return;
    const editableAnalysis =
      path.startsWith("/crm/opportunity/amount/") && analysis.crm.opportunity.amount === null
        ? {
            ...analysis,
            crm: {
              ...analysis.crm,
              opportunity: {
                ...analysis.crm.opportunity,
                amount: { value: 0, currency: "USD" },
              },
            },
          }
        : analysis;
    setAnalysis(setAtPath(editableAnalysis, path, value));
    setEditedPaths((current) => current.includes(path) ? current : [...current, path]);
    setReviewStatus("in_review");
    setNotice(`${path.split("/").filter(Boolean).at(-1)?.replaceAll("_", " ")} marked as user edited.`);
  };

  const reset = async () => {
    if (editedPaths.length && !window.confirm("Reset every edit to the bundled precomputed result?")) return;
    const result = await precomputedConversationAnalyzer.analyze({ transcript_id: selectedId });
    setAnalysis(result);
    setEditedPaths([]);
    setReviewStatus("unreviewed");
    setActiveEvidenceId(null);
    setActiveTurnId(null);
    setNotice("All edits reset to the bundled precomputed result.");
  };

  const showEvidence = (item: Evidence) => {
    setActiveEvidenceId(item.evidence_id);
    setActiveTurnId(item.turn_id);
    setActiveTab("evidence");
    requestAnimationFrame(() => {
      document.getElementById(`turn-${item.turn_id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      transcriptPanel.current?.focus({ preventScroll: true });
    });
  };

  const exportFile = (kind: "json" | "crm" | "tasks" | "email") => {
    if (!analysis) return;
    const slug = analysis.simulation.transcript_id;
    if (kind === "json") downloadText(`${slug}-reviewed.json`, buildJsonExport(analysis, editedPaths, reviewStatus), "application/json");
    if (kind === "crm") downloadText(`${slug}-crm.csv`, buildCrmCsv(analysis), "text/csv");
    if (kind === "tasks") downloadText(`${slug}-tasks.csv`, buildTaskCsv(analysis), "text/csv");
    if (kind === "email") downloadText(`${slug}-email.txt`, buildEmailExport(analysis), "text/plain");
    setNotice(`${kind === "crm" ? "CRM CSV" : titleCase(kind)} export prepared in your browser.`);
  };

  const input = (label: string, path: string, value: Value, options?: { type?: string; wide?: boolean; evidence?: Evidence; min?: string; list?: boolean }) => (
    <Field label={label} path={path} edited={editedPaths.includes(path)} evidence={options?.evidence ?? evidenceByPath.get(path)} onEvidence={showEvidence} wide={options?.wide}>
      <input
        id={path}
        type={options?.type ?? "text"}
        value={value ?? ""}
        min={options?.min}
        onChange={(event) => update(
          path,
          options?.type === "number"
            ? (event.target.value === "" ? null : Number(event.target.value))
            : options?.list
              ? event.target.value.split(",").map((item) => item.trim()).filter(Boolean)
              : (event.target.value || null),
        )}
      />
    </Field>
  );

  const textarea = (label: string, path: string, value: string | null, evidence?: Evidence) => (
    <Field label={label} path={path} edited={editedPaths.includes(path)} evidence={evidence ?? evidenceByPath.get(path)} onEvidence={showEvidence} wide>
      <textarea id={path} value={value ?? ""} rows={3} onChange={(event) => update(path, event.target.value || null)} />
    </Field>
  );

  const select = (label: string, path: string, value: string, options: string[], evidence?: Evidence) => (
    <Field label={label} path={path} edited={editedPaths.includes(path)} evidence={evidence ?? evidenceByPath.get(path)} onEvidence={showEvidence}>
      <select id={path} value={value} onChange={(event) => update(path, event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{titleCase(option)}</option>)}
      </select>
    </Field>
  );

  return (
    <main>
      <a className="skip-link" href="#review-workspace">Skip to review workspace</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Signal Ledger home">
          <span className="brand__mark">SL</span>
          <span><strong>Signal Ledger</strong><small>Commercial conversation intelligence</small></span>
        </a>
        <div className="header__meta">
          <span className="status-dot"><i /> Deterministic demo</span>
          <a href="#about">About this project <ArrowUpRight size={14} /></a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero__copy">
          <div className="kicker"><Sparkles size={14} /> Portfolio system · Public Version 1</div>
          <h1>Turn a commercial conversation into an <em>auditable record.</em></h1>
          <p>Explore how fictional sales calls become structured CRM fields, executive intelligence, actions, and a reviewed follow-up—without live AI or external systems.</p>
          <div className="hero__proof">
            <span><ShieldCheck size={18} /> Fictional data only</span>
            <span><DatabaseZap size={18} /> No persistence</span>
            <span><SearchCheck size={18} /> Evidence mapped</span>
          </div>
        </div>
        <div className="hero__folio" aria-label="Demonstration summary">
          <div><small>Scenario library</small><strong>04</strong><span>distinct call motions</span></div>
          <div><small>Workflow</small><strong>Review</strong><span>before every export</span></div>
          <div><small>Runtime mode</small><strong>Static</strong><span>precomputed outputs</span></div>
        </div>
      </section>

      <section className="simulation-banner" aria-label="Simulation disclosure">
        <div className="simulation-banner__icon"><WandSparkles size={20} /></div>
        <div>
          <strong>Simulated AI workflow</strong>
          <span>This public demonstration uses bundled fictional transcripts and deterministic precomputed results. It does not perform live analysis.</span>
        </div>
        <Badge tone="info">No external calls</Badge>
      </section>

      <section className="scenario-section" aria-labelledby="scenario-title">
        <div className="section-heading">
          <div><span className="section-number">01</span><div><h2 id="scenario-title">Choose a fictional call</h2><p>Four commercial moments, each designed to surface different review decisions.</p></div></div>
          <span className="selection-count">1 of 4 selected</span>
        </div>
        <div className="scenario-grid" role="radiogroup" aria-label="Fictional call scenarios">
          {scenarios.map((scenario, index) => {
            const selectedScenario = selectedId === scenario.transcript.transcript_id;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={selectedScenario}
                className={`scenario-card scenario-card--${scenario.accent} ${selectedScenario ? "is-selected" : ""}`}
                key={scenario.transcript.transcript_id}
                onClick={() => chooseScenario(scenario.transcript.transcript_id)}
              >
                <span className="scenario-card__top"><span>0{index + 1}</span>{selectedScenario && <CheckCircle2 size={18} />}</span>
                <span className="scenario-card__eyebrow">{scenario.eyebrow}</span>
                <strong>{scenario.transcript.fictional_account_name}</strong>
                <span className="scenario-card__summary">{scenario.summary}</span>
                <span className="scenario-card__foot">{scenario.transcript.turns.length} transcript turns <ChevronRight size={15} /></span>
              </button>
            );
          })}
        </div>
      </section>

      {!analysis ? (
        <section className="launch-panel" id="review-workspace">
          <div className="launch-panel__index">02</div>
          <div className="launch-panel__copy">
            <span className={`scenario-chip scenario-chip--${selected.accent}`}>{selected.eyebrow}</span>
            <h2>{selected.transcript.title}</h2>
            <p>{selected.transcript.fictional_account_name} · {formatDate(selected.transcript.call_date)} · {selected.transcript.participants.length} participants</p>
          </div>
          <button className="button button--primary button--large" type="button" onClick={loadAnalysis} disabled={isLoading}>
            {isLoading ? <RefreshCcw className="spin" size={18} /> : <Sparkles size={18} />}
            {isLoading ? "Loading example…" : "Load simulated analysis"}
          </button>
        </section>
      ) : (
        <section className="workspace" id="review-workspace">
          <div className="workspace__head">
            <div>
              <span className="section-number">02</span>
              <div><span className={`scenario-chip scenario-chip--${selected.accent}`}>{selected.eyebrow}</span><h2>Review workspace</h2><p>{selected.transcript.fictional_account_name} · {selected.transcript.title}</p></div>
            </div>
            <div className="workspace__actions">
              <span className={`review-status review-status--${reviewStatus}`}><i /> {titleCase(reviewStatus)}</span>
              <button className="button button--quiet" type="button" onClick={reset}><RotateCcw size={16} /> Reset</button>
              <button className="button button--dark" type="button" onClick={() => { setReviewStatus("reviewed"); setNotice("Review marked complete. Exports will include the reviewed status."); }}><ClipboardCheck size={16} /> Mark reviewed</button>
            </div>
          </div>

          <div className="workspace__metrics" aria-label="Analysis overview">
            <div><Target size={18} /><span><small>Opportunity stage</small><strong>{stageLabels[analysis.crm.opportunity.stage]}</strong></span></div>
            <div><CircleDollarSign size={18} /><span><small>Fictional value</small><strong>{analysis.crm.opportunity.amount ? `${analysis.crm.opportunity.amount.currency} ${analysis.crm.opportunity.amount.value.toLocaleString()}` : "Not discussed"}</strong></span></div>
            <div><UserRoundCheck size={18} /><span><small>Contacts mapped</small><strong>{analysis.crm.contacts.length}</strong></span></div>
            <div><AlertTriangle size={18} /><span><small>Review warnings</small><strong>{analysis.quality.warnings.length}</strong></span></div>
            <div><SearchCheck size={18} /><span><small>Evidence links</small><strong>{analysis.quality.evidence.length}</strong></span></div>
          </div>

          <div className="workspace__body">
            <aside className="transcript-panel" ref={transcriptPanel} tabIndex={-1} aria-label="Fictional transcript">
              <div className="transcript-panel__head">
                <div><span>Source record</span><h3>Fictional transcript</h3></div>
                <Badge>{selected.transcript.turns.length} turns</Badge>
              </div>
              <div className="participant-key">
                {selected.transcript.participants.map((person) => <span key={person.participant_id}><i className={`speaker-dot speaker-dot--${person.side}`} />{person.fictional_name}</span>)}
              </div>
              <div className="turn-list">
                {selected.transcript.turns.map((turn) => {
                  const speaker = selected.transcript.participants.find((person) => person.participant_id === turn.participant_id)!;
                  return (
                    <article id={`turn-${turn.turn_id}`} className={`turn ${activeTurnId === turn.turn_id ? "is-active" : ""}`} key={turn.turn_id}>
                      <div className="turn__meta"><span>{speaker.fictional_name}</span><small>{turn.turn_id.toUpperCase()}</small></div>
                      <p>{turn.text}</p>
                    </article>
                  );
                })}
              </div>
            </aside>

            <div className="review-panel">
              <div className="tabs" role="tablist" aria-label="Review sections">
                {([
                  ["brief", "Executive brief"], ["crm", "CRM record"], ["follow-up", "Follow-up"], ["evidence", `Evidence · ${analysis.quality.evidence.length}`],
                ] as Array<[Tab, string]>).map(([tab, label]) => (
                  <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}>{label}</button>
                ))}
              </div>

              {activeTab === "brief" && (
                <div className="tab-content" role="tabpanel">
                  <div className="content-heading"><div><span>01 / Intelligence</span><h3>Executive brief</h3></div><Badge tone="positive">{Math.round(analysis.quality.overall_simulated_confidence * 100)}% simulated confidence</Badge></div>
                  {textarea("Executive summary", "/intelligence/executive_summary", analysis.intelligence.executive_summary)}

                  <EditorSection icon={<Target size={18} />} title="Customer goals" description="Directly stated or carefully inferred outcomes.">
                    {analysis.intelligence.customer_goals.map((goal, index) => <div key={`goal-${index}`}>{textarea(`Goal ${index + 1}`, `/intelligence/customer_goals/${index}`, goal, evidenceByPath.get(`/intelligence/customer_goals/${index}`))}</div>)}
                  </EditorSection>

                  <EditorSection icon={<AlertTriangle size={18} />} title="Pain points" description="Operational friction and business impact.">
                    {analysis.intelligence.pain_points.map((pain, index) => <div className="editor-card" key={`pain-${index}`}>
                      <span className="editor-card__index">0{index + 1}</span>
                      <div className="form-grid">
                        {textarea("Description", `/intelligence/pain_points/${index}/description`, pain.description, evidenceByPath.get(`/intelligence/pain_points/${index}`))}
                        {textarea("Business impact", `/intelligence/pain_points/${index}/business_impact`, pain.business_impact)}
                        {select("Priority", `/intelligence/pain_points/${index}/priority`, pain.priority, ["high", "medium", "low", "unknown"])}
                      </div>
                    </div>)}
                  </EditorSection>

                  <EditorSection icon={<ShieldCheck size={18} />} title="Requirements" description="Business, technical, and governance conditions.">
                    {analysis.intelligence.requirements.map((requirement, index) => <div className="editor-card" key={`requirement-${index}`}>
                      <span className="editor-card__index">0{index + 1}</span>
                      <div className="form-grid">
                        {textarea("Requirement", `/intelligence/requirements/${index}/description`, requirement.description, evidenceByPath.get(`/intelligence/requirements/${index}`))}
                        {select("Type", `/intelligence/requirements/${index}/type`, requirement.type, ["business", "technical", "security", "legal", "commercial", "implementation", "unknown"])}
                        {select("Support", `/intelligence/requirements/${index}/support`, requirement.support, ["direct", "inferred"])}
                      </div>
                    </div>)}
                  </EditorSection>

                  <EditorSection icon={<MessageSquareQuote size={18} />} title="Objections" description="Open questions or conditions surfaced in the call.">
                    {analysis.intelligence.objections.length === 0 ? <EmptyState message="No explicit objections were identified in this fictional call." /> : analysis.intelligence.objections.map((objection, index) => <div className="editor-card" key={`objection-${index}`}>
                      <span className="editor-card__index">0{index + 1}</span>
                      <div className="form-grid">
                        {textarea("Objection", `/intelligence/objections/${index}/description`, objection.description, evidenceByPath.get(`/intelligence/objections/${index}`))}
                        {select("Category", `/intelligence/objections/${index}/category`, objection.category, ["price", "timing", "technical", "security", "legal", "competition", "authority", "other"])}
                        {select("Resolution", `/intelligence/objections/${index}/resolution_status`, objection.resolution_status, ["resolved", "open", "unclear"])}
                      </div>
                    </div>)}
                  </EditorSection>

                  <EditorSection icon={<CheckCircle2 size={18} />} title="Qualification" description="Budget, authority, need, and timeline signals.">
                    <div className="qualification-grid">
                      {(Object.entries(analysis.intelligence.qualification) as Array<[keyof typeof analysis.intelligence.qualification, typeof analysis.intelligence.qualification.budget]>).map(([key, signal]) => <div className="qualification-card" key={key}>
                        <div><span>{titleCase(key)}</span>{select("Status", `/intelligence/qualification/${key}/status`, signal.status, ["confirmed", "inferred", "not_discussed"], evidenceByPath.get(`/intelligence/qualification/${key}`))}</div>
                        {textarea("Detail", `/intelligence/qualification/${key}/detail`, signal.detail)}
                      </div>)}
                    </div>
                  </EditorSection>

                  <EditorSection icon={<BriefcaseBusiness size={18} />} title="Commercial read" description="Sentiment, competition, and risks.">
                    <div className="form-grid">
                      {select("Overall sentiment", "/intelligence/sentiment/overall", analysis.intelligence.sentiment.overall, ["positive", "neutral", "negative", "mixed", "unknown"])}
                      {textarea("Sentiment explanation", "/intelligence/sentiment/explanation", analysis.intelligence.sentiment.explanation)}
                      {input("Competitors mentioned", "/intelligence/competitors_mentioned", analysis.intelligence.competitors_mentioned.join(", "), { wide: true, list: true })}
                    </div>
                    {analysis.intelligence.risks.map((risk, index) => <div className="editor-card" key={`risk-${index}`}>
                      <span className="editor-card__index">R{index + 1}</span>
                      <div className="form-grid">
                        {textarea("Risk", `/intelligence/risks/${index}/description`, risk.description)}
                        {select("Severity", `/intelligence/risks/${index}/severity`, risk.severity, ["high", "medium", "low"])}
                        {textarea("Suggested mitigation", `/intelligence/risks/${index}/suggested_mitigation`, risk.suggested_mitigation)}
                      </div>
                    </div>)}
                  </EditorSection>
                </div>
              )}

              {activeTab === "crm" && (
                <div className="tab-content" role="tabpanel">
                  <div className="content-heading"><div><span>02 / Structured record</span><h3>CRM-ready fields</h3></div><Badge tone="info">Review before export</Badge></div>
                  <EditorSection icon={<BriefcaseBusiness size={18} />} title="Account" description="Canonical organization record.">
                    <div className="form-grid form-grid--three">
                      {input("Account name", "/crm/account/name", analysis.crm.account.name)}
                      {input("Industry", "/crm/account/industry", analysis.crm.account.industry)}
                      {input("Location", "/crm/account/location", analysis.crm.account.location)}
                    </div>
                  </EditorSection>
                  <EditorSection icon={<CircleDollarSign size={18} />} title="Opportunity" description="Commercial context and next action.">
                    <div className="form-grid form-grid--three">
                      {input("Opportunity name", "/crm/opportunity/name", analysis.crm.opportunity.name)}
                      {select("Stage", "/crm/opportunity/stage", analysis.crm.opportunity.stage, Object.keys(stageLabels), evidenceByPath.get("/crm/opportunity/stage"))}
                      {input("Expected close", "/crm/opportunity/expected_close_date", analysis.crm.opportunity.expected_close_date, { type: "date", evidence: evidenceByPath.get("/crm/opportunity/expected_close_date") })}
                      {input("Amount", "/crm/opportunity/amount/value", analysis.crm.opportunity.amount?.value ?? null, { type: "number", evidence: evidenceByPath.get("/crm/opportunity/amount"), min: "0" })}
                      {input("Currency", "/crm/opportunity/amount/currency", analysis.crm.opportunity.amount?.currency ?? null)}
                      {input("Products / services", "/crm/opportunity/products_or_services", analysis.crm.opportunity.products_or_services.join(", "), { list: true })}
                      {textarea("Use case", "/crm/opportunity/use_case", analysis.crm.opportunity.use_case)}
                      {textarea("Next step", "/crm/opportunity/next_step", analysis.crm.opportunity.next_step, evidenceByPath.get("/crm/opportunity/next_step"))}
                    </div>
                  </EditorSection>
                  <EditorSection icon={<UsersRound size={18} />} title="Contacts" description="Fictional buying-group and seller roles.">
                    {analysis.crm.contacts.map((contact, index) => <div className="editor-card" key={`contact-${index}`}>
                      <span className="editor-card__index">0{index + 1}</span>
                      <div className="form-grid form-grid--four">
                        {input("Name", `/crm/contacts/${index}/name`, contact.name)}
                        {input("Title", `/crm/contacts/${index}/title`, contact.title)}
                        {input("Email", `/crm/contacts/${index}/email`, contact.email, { type: "email" })}
                        {select("Role", `/crm/contacts/${index}/role`, contact.role, ["decision_maker", "champion", "influencer", "end_user", "technical", "procurement", "legal", "seller", "unknown"])}
                      </div>
                    </div>)}
                  </EditorSection>
                  <EditorSection icon={<ClipboardCheck size={18} />} title="Activity" description="Sales-call activity prepared for a generic CRM.">
                    <div className="form-grid form-grid--three">
                      {input("Subject", "/crm/activity/subject", analysis.crm.activity.subject)}
                      {input("Occurred at", "/crm/activity/occurred_at", analysis.crm.activity.occurred_at, { type: "date" })}
                      {input("Duration (minutes)", "/crm/activity/duration_minutes", analysis.crm.activity.duration_minutes, { type: "number", min: "0" })}
                      {input("Participants", "/crm/activity/participant_names", analysis.crm.activity.participant_names.join(", "), { wide: true, list: true })}
                      {textarea("Concise notes", "/crm/activity/concise_notes", analysis.crm.activity.concise_notes)}
                    </div>
                  </EditorSection>
                </div>
              )}

              {activeTab === "follow-up" && (
                <div className="tab-content" role="tabpanel">
                  <div className="content-heading"><div><span>03 / Action layer</span><h3>Follow-up package</h3></div><Badge tone="warning">Human review required</Badge></div>
                  <EditorSection icon={<ClipboardCheck size={18} />} title="Tasks" description="Explicit commitments remain distinct from suggestions.">
                    {analysis.follow_up.tasks.map((task, index) => <div className="task-card" key={task.task_id}>
                      <div className="task-card__head"><span className="task-number">{String(index + 1).padStart(2, "0")}</span><Badge tone={task.source === "explicit_commitment" ? "positive" : "neutral"}>{titleCase(task.source)}</Badge></div>
                      <div className="form-grid form-grid--three">
                        {input("Title", `/follow_up/tasks/${index}/title`, task.title)}
                        {select("Owner", `/follow_up/tasks/${index}/owner_role`, task.owner_role, ["seller", "customer", "shared", "unknown"])}
                        {input("Due date", `/follow_up/tasks/${index}/due_date`, task.due_date, { type: "date" })}
                        {textarea("Description", `/follow_up/tasks/${index}/description`, task.description)}
                        {select("Priority", `/follow_up/tasks/${index}/priority`, task.priority, ["high", "medium", "low"])}
                        {select("Source", `/follow_up/tasks/${index}/source`, task.source, ["explicit_commitment", "suggested"])}
                      </div>
                    </div>)}
                  </EditorSection>
                  <EditorSection icon={<Mail size={18} />} title="Email draft" description="Draft only. Nothing is sent from this demonstration.">
                    {input("Subject", "/follow_up/email/subject", analysis.follow_up.email.subject, { wide: true })}
                    <Field label="Email body" path="/follow_up/email/body" edited={editedPaths.includes("/follow_up/email/body")} wide>
                      <textarea id="/follow_up/email/body" className="email-body" value={analysis.follow_up.email.body} rows={12} onChange={(event) => update("/follow_up/email/body", event.target.value)} />
                    </Field>
                    <div className="draft-guard"><ShieldCheck size={17} /><span><strong>Draft safeguard</strong>This text is never sent. Export creates a local `.txt` file for review.</span></div>
                  </EditorSection>
                </div>
              )}

              {activeTab === "evidence" && (
                <div className="tab-content" role="tabpanel">
                  <div className="content-heading"><div><span>04 / Traceability</span><h3>Evidence & warnings</h3></div><Badge tone="info">Exact transcript quotes</Badge></div>
                  <div className="confidence-card">
                    <div className="confidence-ring" style={{ "--score": `${analysis.quality.overall_simulated_confidence * 360}deg` } as React.CSSProperties}><span>{Math.round(analysis.quality.overall_simulated_confidence * 100)}</span><small>%</small></div>
                    <div><span>Simulated confidence</span><h4>Editorial signal, not a live probability</h4><p>Use warnings and source quotations to make the final human judgment.</p></div>
                  </div>
                  <div className="warning-list">
                    {analysis.quality.warnings.map((warning) => <article className={`warning-card warning-card--${warning.severity}`} key={warning.warning_id}>
                      <AlertTriangle size={18} /><div><span>{warning.field_path ?? "General review"}</span><p>{warning.message}</p></div>
                    </article>)}
                  </div>
                  <div className="evidence-list">
                    {analysis.quality.evidence.map((item, index) => <button type="button" className={`evidence-card ${activeEvidenceId === item.evidence_id ? "is-active" : ""}`} key={item.evidence_id} onClick={() => showEvidence(item)}>
                      <span className="evidence-card__index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="evidence-card__main"><small>{item.field_path}</small><q>{item.quote}</q><span><Badge tone={item.support === "direct" ? "positive" : "warning"}>{titleCase(item.support)}</Badge>{Math.round(item.simulated_confidence * 100)}% simulated confidence · {item.turn_id.toUpperCase()}</span></span>
                      <SearchCheck size={18} />
                    </button>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="export-bar">
            <div><span className="section-number">03</span><div><h3>Export the reviewed record</h3><p>Files are assembled locally in your browser. Nothing is transmitted.</p></div></div>
            <div className="export-actions">
              <button type="button" onClick={() => exportFile("json")}><FileJson2 size={17} /><span>Complete JSON<small>Full reviewed record</small></span><Download size={15} /></button>
              <button type="button" onClick={() => exportFile("crm")}><FileSpreadsheet size={17} /><span>CRM-field CSV<small>Canonical fields</small></span><Download size={15} /></button>
              <button type="button" onClick={() => exportFile("tasks")}><ClipboardCheck size={17} /><span>Task CSV<small>Owners & dates</small></span><Download size={15} /></button>
              <button type="button" onClick={() => exportFile("email")}><Mail size={17} /><span>Email draft<small>Plain text</small></span><Download size={15} /></button>
            </div>
          </div>
        </section>
      )}

      <p className="sr-only" aria-live="polite">{notice}</p>

      <section className="method" id="about">
        <div className="method__intro"><span className="section-number">04</span><div><span className="kicker">Designed for accountable automation</span><h2>Structure first.<br /><em>Human judgment always.</em></h2></div></div>
        <div className="method__steps">
          <article><span>01</span><MessageSquareQuote size={20} /><h3>Trace</h3><p>Every important claim can return to an exact fictional transcript turn.</p></article>
          <article><span>02</span><Copy size={20} /><h3>Review</h3><p>Fields remain editable and every human change is visibly marked.</p></article>
          <article><span>03</span><ShieldCheck size={20} /><h3>Approve</h3><p>Warnings stay visible and outputs remain drafts until marked reviewed.</p></article>
          <article><span>04</span><Download size={20} /><h3>Export</h3><p>Portable files are generated locally, with no external system writes.</p></article>
        </div>
      </section>

      <footer>
        <div className="brand brand--footer"><span className="brand__mark">SL</span><span><strong>Signal Ledger</strong><small>Independent portfolio project</small></span></div>
        <p>Entirely fictional data · Deterministic precomputed outputs · No live AI</p>
        <p>© 2026 Adeel Tagar. All rights reserved.</p>
      </footer>
    </main>
  );
}

function EditorSection({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return <section className="editor-section"><div className="editor-section__head"><span>{icon}</span><div><h4>{title}</h4><p>{description}</p></div></div><div className="editor-section__body">{children}</div></section>;
}

function EmptyState({ message }: { message: string }) {
  return <div className="empty-state"><CheckCircle2 size={18} /><span>{message}</span></div>;
}
