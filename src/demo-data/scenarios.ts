import type { ConversationAnalysis, DemoScenario, Evidence, SyntheticTranscript } from "@/src/domain/types";

const NOTICE = "Simulated AI workflow using a precomputed fictional example." as const;

function evidence(
  id: string,
  fieldPath: string,
  turnId: string,
  quote: string,
  support: Evidence["support"] = "direct",
  confidence = 0.94,
): Evidence {
  return {
    evidence_id: id,
    field_path: fieldPath,
    turn_id: turnId,
    quote,
    start_character: 0,
    end_character: quote.length,
    support,
    simulated_confidence: confidence,
  };
}

function finalize(
  transcript: SyntheticTranscript,
  content: Omit<ConversationAnalysis, "schema_version" | "simulation">,
): ConversationAnalysis {
  const turns = new Map(transcript.turns.map((turn) => [turn.turn_id, turn.text]));
  const mappedEvidence = content.quality.evidence.map((item) => {
    const text = turns.get(item.turn_id) ?? "";
    const start = text.indexOf(item.quote);
    if (start < 0) throw new Error(`Evidence ${item.evidence_id} does not match ${item.turn_id}`);
    return { ...item, start_character: start, end_character: start + item.quote.length };
  });

  return {
    schema_version: "1.0",
    simulation: {
      mode: "precomputed_demo",
      transcript_id: transcript.transcript_id,
      analysis_version: "1.0",
      notice: NOTICE,
    },
    ...content,
    quality: { ...content.quality, evidence: mappedEvidence },
  };
}

const discoveryTranscript: SyntheticTranscript = {
  schema_version: "1.0",
  transcript_id: "call-discovery-thistle-byte",
  title: "Store operations discovery",
  scenario: "discovery",
  fictional_account_name: "Thistle & Byte Markets",
  call_date: "2026-04-08",
  language: "en",
  participants: [
    { participant_id: "p-seller", fictional_name: "Niko Arden", fictional_title: "Account Executive", side: "seller" },
    { participant_id: "p-mara", fictional_name: "Mara Venn", fictional_title: "Director of Store Operations", side: "customer" },
    { participant_id: "p-eli", fictional_name: "Eli Tern", fictional_title: "Regional Operations Manager", side: "customer" },
  ],
  turns: [
    { turn_id: "d-01", participant_id: "p-seller", text: "Thanks for joining. I would like to understand how your store teams coordinate daily operating issues before we discuss RelayDesk." },
    { turn_id: "d-02", participant_id: "p-mara", text: "We have twenty-eight fictional neighborhood stores. Managers report equipment, staffing, and supplier issues through email, chat, and a shared sheet." },
    { turn_id: "d-03", participant_id: "p-eli", text: "The painful part is the morning handoff. I spend about six hours each week combining updates, and urgent items can sit unnoticed until the afternoon." },
    { turn_id: "d-04", participant_id: "p-mara", text: "Our goal is one prioritized operating view for every region, with clear ownership and a record of when an issue was resolved." },
    { turn_id: "d-05", participant_id: "p-seller", text: "Would a pilot across a subset of stores be a reasonable next step?" },
    { turn_id: "d-06", participant_id: "p-mara", text: "Yes. Start with five stores in the west region. We would want the regional leads involved and a simple weekly adoption report." },
    { turn_id: "d-07", participant_id: "p-eli", text: "Mobile access matters. Managers are rarely at a desk, and anything that takes more than a minute to update will be ignored." },
    { turn_id: "d-08", participant_id: "p-mara", text: "Send a pilot outline by April 15. Budget has not been discussed yet; first we need to see the workflow and the effort required." },
  ],
};

const discoveryAnalysis = finalize(discoveryTranscript, {
  crm: {
    account: { name: "Thistle & Byte Markets", industry: "Specialty grocery retail", location: "Fictional multi-region operator" },
    contacts: [
      { name: "Mara Venn", title: "Director of Store Operations", email: "mara.venn@example.com", role: "decision_maker" },
      { name: "Eli Tern", title: "Regional Operations Manager", email: "eli.tern@example.com", role: "champion" },
      { name: "Niko Arden", title: "Account Executive", email: "niko.arden@example.com", role: "seller" },
    ],
    opportunity: {
      name: "West region operations pilot",
      stage: "discovery",
      use_case: "Centralize and prioritize store operating issues",
      products_or_services: ["RelayDesk"],
      amount: null,
      expected_close_date: null,
      next_step: "Send a five-store pilot outline by 2026-04-15",
    },
    activity: {
      type: "sales_call",
      subject: "Store operations workflow discovery",
      occurred_at: "2026-04-08",
      duration_minutes: 31,
      participant_names: ["Niko Arden", "Mara Venn", "Eli Tern"],
      concise_notes: "Explored fragmented issue reporting and aligned on a five-store west-region pilot outline.",
    },
  },
  intelligence: {
    executive_summary: "Thistle & Byte Markets is exploring RelayDesk to replace fragmented email, chat, and spreadsheet workflows for store operating issues. The team wants a prioritized regional view, clear ownership, mobile-friendly updates, and resolution history. Mara Venn agreed to evaluate a five-store west-region pilot with regional leads and weekly adoption reporting. Budget and close timing remain unconfirmed; the immediate commitment is a pilot outline by April 15.",
    customer_goals: ["Create one prioritized regional operating view", "Assign clear ownership to every issue", "Track resolution history", "Measure pilot adoption weekly"],
    pain_points: [
      { description: "Operating issues are fragmented across three channels", business_impact: "Urgent items can remain unnoticed until afternoon", priority: "high" },
      { description: "Regional reporting requires manual consolidation", business_impact: "Approximately six hours of work each week", priority: "medium" },
    ],
    requirements: [
      { description: "Mobile-friendly issue updates that take less than one minute", type: "technical", support: "direct" },
      { description: "Weekly pilot adoption report", type: "business", support: "direct" },
    ],
    objections: [],
    competitors_mentioned: [],
    qualification: {
      budget: { status: "not_discussed", detail: "Mara explicitly deferred budget discussion until after workflow review." },
      authority: { status: "inferred", detail: "Mara directs store operations and authorized pilot planning; final purchasing authority was not confirmed." },
      need: { status: "confirmed", detail: "Fragmented reporting, slow urgent-item visibility, and manual consolidation were described." },
      timeline: { status: "inferred", detail: "Pilot outline requested for April 15; no purchase date was discussed." },
    },
    sentiment: { overall: "positive", explanation: "The customer accepted a concrete pilot scope while being appropriately cautious about effort and budget." },
    risks: [
      { description: "Budget and final purchasing process are unknown", severity: "medium", suggested_mitigation: "Add decision process and commercial discovery to the pilot review." },
      { description: "Adoption may fail if updates are cumbersome", severity: "medium", suggested_mitigation: "Demonstrate a sub-minute mobile update flow in the pilot." },
    ],
  },
  follow_up: {
    tasks: [
      { task_id: "d-task-1", title: "Send five-store pilot outline", description: "Include west-region scope, regional lead participation, and weekly adoption reporting.", owner_role: "seller", due_date: "2026-04-15", priority: "high", source: "explicit_commitment" },
      { task_id: "d-task-2", title: "Confirm decision process and budget owner", description: "Add to the next discovery agenda.", owner_role: "seller", due_date: null, priority: "medium", source: "suggested" },
    ],
    email: {
      subject: "Thistle & Byte | five-store pilot outline",
      body: "Hi Mara and Eli,\n\nThank you for walking through the current store-issue workflow. I captured the priorities as a single regional view, clear ownership, mobile-friendly updates, resolution history, and a weekly adoption report.\n\nI’ll send a five-store west-region pilot outline by April 15. It will include the proposed workflow, regional lead involvement, and a lightweight adoption view.\n\nBest,\nNiko",
      tone: "professional",
      requires_human_review: true,
    },
  },
  quality: {
    overall_simulated_confidence: 0.91,
    missing_critical_fields: ["/crm/opportunity/amount", "/crm/opportunity/expected_close_date"],
    warnings: [
      { warning_id: "d-warn-1", field_path: "/crm/opportunity/amount", severity: "warning", message: "Budget was explicitly not discussed; no amount should be inferred." },
      { warning_id: "d-warn-2", field_path: "/intelligence/qualification/authority", severity: "info", message: "Operational authority is visible, but final purchasing authority is unconfirmed." },
    ],
    evidence: [
      evidence("d-ev-1", "/intelligence/pain_points/0", "d-03", "urgent items can sit unnoticed until the afternoon"),
      evidence("d-ev-2", "/intelligence/customer_goals/0", "d-04", "one prioritized operating view for every region"),
      evidence("d-ev-3", "/intelligence/requirements/0", "d-07", "anything that takes more than a minute to update will be ignored"),
      evidence("d-ev-4", "/crm/opportunity/next_step", "d-08", "Send a pilot outline by April 15"),
      evidence("d-ev-5", "/intelligence/qualification/budget", "d-08", "Budget has not been discussed yet", "direct", 0.99),
    ],
  },
});

const qualificationTranscript: SyntheticTranscript = {
  schema_version: "1.0",
  transcript_id: "call-qualification-brindle-harbor",
  title: "Expansion qualification",
  scenario: "qualification",
  fictional_account_name: "Brindle Harbor Logistics",
  call_date: "2026-05-13",
  language: "en",
  participants: [
    { participant_id: "q-seller", fictional_name: "Sela North", fictional_title: "Commercial Lead", side: "seller" },
    { participant_id: "q-keon", fictional_name: "Keon Vale", fictional_title: "Vice President, Network Operations", side: "customer" },
    { participant_id: "q-priya", fictional_name: "Priya Moss", fictional_title: "Finance Operations Partner", side: "customer" },
  ],
  turns: [
    { turn_id: "q-01", participant_id: "q-seller", text: "To make the evaluation useful, can we confirm the operational need, decision group, timing, and funding range for RouteNest?" },
    { turn_id: "q-02", participant_id: "q-keon", text: "We are opening two fictional distribution hubs in September. Our current exception process will not scale beyond the existing seven hubs." },
    { turn_id: "q-03", participant_id: "q-priya", text: "A planning range of 110,000 to 125,000 fictional dollars is reserved, subject to the operations case and security review." },
    { turn_id: "q-04", participant_id: "q-keon", text: "I will sponsor the recommendation. Priya and I will bring it to the operating committee, and security must sign off before contracting." },
    { turn_id: "q-05", participant_id: "q-seller", text: "What outcome would make the case compelling?" },
    { turn_id: "q-06", participant_id: "q-keon", text: "Reduce exception triage from forty minutes to under fifteen and give hub leaders the same escalation view." },
    { turn_id: "q-07", participant_id: "q-priya", text: "We need a decision by July 10 so implementation can finish before the September openings." },
    { turn_id: "q-08", participant_id: "q-keon", text: "Please send the value model and a security overview by May 20. We will schedule the committee review after that." },
  ],
};

const qualificationAnalysis = finalize(qualificationTranscript, {
  crm: {
    account: { name: "Brindle Harbor Logistics", industry: "Fictional distribution logistics", location: "Seven-hub fictional network" },
    contacts: [
      { name: "Keon Vale", title: "Vice President, Network Operations", email: "keon.vale@example.com", role: "champion" },
      { name: "Priya Moss", title: "Finance Operations Partner", email: "priya.moss@example.com", role: "influencer" },
      { name: "Sela North", title: "Commercial Lead", email: "sela.north@example.com", role: "seller" },
    ],
    opportunity: {
      name: "Network exception management expansion",
      stage: "qualification",
      use_case: "Standardize exception triage before two new hub openings",
      products_or_services: ["RouteNest"],
      amount: { value: 118000, currency: "USD" },
      expected_close_date: "2026-07-10",
      next_step: "Send value model and security overview by 2026-05-20",
    },
    activity: {
      type: "sales_call", subject: "Expansion qualification and decision path", occurred_at: "2026-05-13", duration_minutes: 36,
      participant_names: ["Sela North", "Keon Vale", "Priya Moss"],
      concise_notes: "Confirmed need, planning range, sponsor, committee path, security dependency, success metric, and July decision date.",
    },
  },
  intelligence: {
    executive_summary: "Brindle Harbor Logistics has a funded, time-bound initiative to standardize exception triage before two fictional hubs open in September. A planning range of 110,000–125,000 fictional dollars is reserved, with a decision required by July 10. Keon Vale will sponsor the recommendation with Priya Moss to the operating committee; security approval is a contracting dependency. Success means reducing triage from forty minutes to under fifteen and giving hub leaders a common escalation view.",
    customer_goals: ["Reduce exception triage below fifteen minutes", "Standardize escalation visibility across hubs", "Complete implementation before September hub openings"],
    pain_points: [{ description: "The current exception process will not scale beyond seven hubs", business_impact: "Two planned openings create operational risk", priority: "high" }],
    requirements: [
      { description: "Security approval before contracting", type: "security", support: "direct" },
      { description: "Implementation completed before September openings", type: "implementation", support: "direct" },
    ],
    objections: [{ description: "Funding is conditional on the operations case and security review", category: "security", resolution_status: "open" }],
    competitors_mentioned: [],
    qualification: {
      budget: { status: "confirmed", detail: "Planning range of 110,000–125,000 fictional dollars is reserved." },
      authority: { status: "confirmed", detail: "Keon sponsors; Keon and Priya present to the operating committee; security signs off." },
      need: { status: "confirmed", detail: "Existing exception process will not scale for two new hubs." },
      timeline: { status: "confirmed", detail: "Decision by July 10 and implementation before September openings." },
    },
    sentiment: { overall: "positive", explanation: "The team supplied specific qualification details and assigned concrete follow-up deliverables." },
    risks: [{ description: "Security review could delay contracting", severity: "high", suggested_mitigation: "Deliver the security overview early and schedule a reviewer session." }],
  },
  follow_up: {
    tasks: [
      { task_id: "q-task-1", title: "Send value model", description: "Model the triage-time reduction and common escalation view.", owner_role: "seller", due_date: "2026-05-20", priority: "high", source: "explicit_commitment" },
      { task_id: "q-task-2", title: "Send security overview", description: "Provide review material for the fictional security team.", owner_role: "seller", due_date: "2026-05-20", priority: "high", source: "explicit_commitment" },
      { task_id: "q-task-3", title: "Schedule operating committee review", description: "Schedule after value and security materials are received.", owner_role: "customer", due_date: null, priority: "medium", source: "explicit_commitment" },
    ],
    email: {
      subject: "Brindle Harbor | value model and security overview",
      body: "Hi Keon and Priya,\n\nThank you for confirming the expansion timeline and decision path. I captured the target outcome as reducing exception triage from forty minutes to under fifteen while giving every hub leader a consistent escalation view.\n\nI’ll send the value model and security overview by May 20 for your operating committee and security review.\n\nBest,\nSela",
      tone: "professional", requires_human_review: true,
    },
  },
  quality: {
    overall_simulated_confidence: 0.97,
    missing_critical_fields: [],
    warnings: [{ warning_id: "q-warn-1", field_path: "/crm/opportunity/amount", severity: "info", message: "The CRM amount uses the midpoint of a stated planning range; retain the range in reviewed notes." }],
    evidence: [
      evidence("q-ev-1", "/crm/opportunity/amount", "q-03", "110,000 to 125,000 fictional dollars is reserved", "direct", 0.99),
      evidence("q-ev-2", "/intelligence/qualification/authority", "q-04", "Priya and I will bring it to the operating committee"),
      evidence("q-ev-3", "/intelligence/customer_goals/0", "q-06", "Reduce exception triage from forty minutes to under fifteen"),
      evidence("q-ev-4", "/crm/opportunity/expected_close_date", "q-07", "a decision by July 10"),
      evidence("q-ev-5", "/crm/opportunity/next_step", "q-08", "send the value model and a security overview by May 20"),
    ],
  },
});

const technicalTranscript: SyntheticTranscript = {
  schema_version: "1.0",
  transcript_id: "call-technical-copper-finch",
  title: "Security and architecture review",
  scenario: "technical_evaluation",
  fictional_account_name: "Copper Finch Bioworks",
  call_date: "2026-06-03",
  language: "en",
  participants: [
    { participant_id: "t-seller", fictional_name: "Oren Pike", fictional_title: "Solutions Consultant", side: "seller" },
    { participant_id: "t-imani", fictional_name: "Imani Quill", fictional_title: "Head of Research Systems", side: "customer" },
    { participant_id: "t-theo", fictional_name: "Theo Lark", fictional_title: "Security Architect", side: "customer" },
  ],
  turns: [
    { turn_id: "t-01", participant_id: "t-imani", text: "SignalVault would sit between our fictional laboratory request portal and the review queue. We need a clear boundary around what it can read and write." },
    { turn_id: "t-02", participant_id: "t-theo", text: "The required controls are single sign-on, role-based access, regional processing, encryption, and an exportable audit record." },
    { turn_id: "t-03", participant_id: "t-seller", text: "We can map those controls in a written architecture packet and keep the proof of concept read-only." },
    { turn_id: "t-04", participant_id: "t-imani", text: "Read-only is the right starting point. Use synthetic request records and show how reviewers trace a summary back to its source." },
    { turn_id: "t-05", participant_id: "t-theo", text: "No production records and no automated approvals. I also need the retention behavior and deletion path documented before testing." },
    { turn_id: "t-06", participant_id: "t-seller", text: "I will send the control matrix and data-flow diagram by June 9. Could we review them together on June 12?" },
    { turn_id: "t-07", participant_id: "t-theo", text: "June 12 works. If the documents answer the open points, I can approve a two-week synthetic proof of concept." },
    { turn_id: "t-08", participant_id: "t-imani", text: "The business target is a thirty percent reduction in reviewer preparation time without reducing traceability." },
  ],
};

const technicalAnalysis = finalize(technicalTranscript, {
  crm: {
    account: { name: "Copper Finch Bioworks", industry: "Fictional research services", location: "Fictional regional research network" },
    contacts: [
      { name: "Imani Quill", title: "Head of Research Systems", email: "imani.quill@example.com", role: "champion" },
      { name: "Theo Lark", title: "Security Architect", email: "theo.lark@example.com", role: "technical" },
      { name: "Oren Pike", title: "Solutions Consultant", email: "oren.pike@example.com", role: "seller" },
    ],
    opportunity: {
      name: "Research review workflow proof of concept", stage: "evaluation", use_case: "Reduce reviewer preparation time while retaining source traceability",
      products_or_services: ["SignalVault"], amount: { value: 164000, currency: "USD" }, expected_close_date: null,
      next_step: "Send control matrix and data-flow diagram by 2026-06-09",
    },
    activity: {
      type: "sales_call", subject: "Security controls and proof-of-concept boundary", occurred_at: "2026-06-03", duration_minutes: 48,
      participant_names: ["Oren Pike", "Imani Quill", "Theo Lark"],
      concise_notes: "Defined a read-only, synthetic-data proof of concept subject to architecture, retention, deletion, and audit review.",
    },
  },
  intelligence: {
    executive_summary: "Copper Finch Bioworks defined a tightly bounded technical evaluation for SignalVault. The proposed two-week proof of concept must remain read-only, use synthetic records, preserve source traceability, and prohibit automated approvals. Security requires single sign-on, role-based access, regional processing, encryption, audit export, retention details, and a deletion path. Oren Pike will deliver a control matrix and data-flow diagram by June 9 for a June 12 review. The business target is a thirty percent reduction in reviewer preparation time.",
    customer_goals: ["Reduce reviewer preparation time by thirty percent", "Preserve traceability from summaries to source records"],
    pain_points: [{ description: "Reviewer preparation is time-consuming", business_impact: "Slows the fictional laboratory request-review queue", priority: "high" }],
    requirements: [
      { description: "Single sign-on and role-based access", type: "security", support: "direct" },
      { description: "Regional processing and encryption", type: "security", support: "direct" },
      { description: "Exportable audit record, retention behavior, and deletion path", type: "security", support: "direct" },
      { description: "Read-only proof of concept using synthetic request records", type: "technical", support: "direct" },
    ],
    objections: [{ description: "Testing cannot begin until retention and deletion behavior are documented", category: "security", resolution_status: "open" }],
    competitors_mentioned: [],
    qualification: {
      budget: { status: "inferred", detail: "A fictional opportunity estimate exists in the demonstration record, but no budget was stated in the call." },
      authority: { status: "confirmed", detail: "Theo can approve a synthetic proof of concept after the document review." },
      need: { status: "confirmed", detail: "The team stated a measurable preparation-time target and traceability requirement." },
      timeline: { status: "confirmed", detail: "Documents due June 9, review June 12, followed by a possible two-week proof of concept." },
    },
    sentiment: { overall: "neutral", explanation: "The customer is engaged but approval remains conditional on unresolved security documentation." },
    risks: [
      { description: "Retention and deletion controls remain unresolved", severity: "high", suggested_mitigation: "Answer both controls explicitly in the architecture packet before testing." },
      { description: "Opportunity amount is not transcript-supported", severity: "medium", suggested_mitigation: "Confirm commercial scope in a separate reviewed conversation." },
    ],
  },
  follow_up: {
    tasks: [
      { task_id: "t-task-1", title: "Send control matrix", description: "Map each required security control and its proof-of-concept treatment.", owner_role: "seller", due_date: "2026-06-09", priority: "high", source: "explicit_commitment" },
      { task_id: "t-task-2", title: "Send data-flow diagram", description: "Document read and write boundaries, retention, and deletion paths.", owner_role: "seller", due_date: "2026-06-09", priority: "high", source: "explicit_commitment" },
      { task_id: "t-task-3", title: "Review architecture packet", description: "Joint review of the open security points.", owner_role: "shared", due_date: "2026-06-12", priority: "high", source: "explicit_commitment" },
    ],
    email: {
      subject: "Copper Finch | control matrix and data-flow review",
      body: "Hi Imani and Theo,\n\nThank you for defining the proof-of-concept boundary. I captured the starting position as read-only, synthetic records only, source traceability, and no automated approvals.\n\nI’ll send the control matrix and data-flow diagram by June 9, including retention and deletion behavior, for our June 12 review.\n\nBest,\nOren",
      tone: "professional", requires_human_review: true,
    },
  },
  quality: {
    overall_simulated_confidence: 0.89,
    missing_critical_fields: ["/crm/opportunity/expected_close_date"],
    warnings: [
      { warning_id: "t-warn-1", field_path: "/crm/opportunity/amount", severity: "warning", message: "The fictional CRM estimate is not supported by the transcript and requires human confirmation." },
      { warning_id: "t-warn-2", field_path: "/intelligence/objections/0", severity: "warning", message: "Security approval remains conditional on retention and deletion documentation." },
    ],
    evidence: [
      evidence("t-ev-1", "/intelligence/requirements/0", "t-02", "single sign-on, role-based access, regional processing, encryption, and an exportable audit record"),
      evidence("t-ev-2", "/intelligence/requirements/3", "t-04", "Use synthetic request records"),
      evidence("t-ev-3", "/intelligence/objections/0", "t-05", "retention behavior and deletion path documented before testing"),
      evidence("t-ev-4", "/crm/opportunity/next_step", "t-06", "send the control matrix and data-flow diagram by June 9"),
      evidence("t-ev-5", "/intelligence/customer_goals/0", "t-08", "a thirty percent reduction in reviewer preparation time"),
    ],
  },
});

const commercialTranscript: SyntheticTranscript = {
  schema_version: "1.0",
  transcript_id: "call-commercial-morrowglass",
  title: "Commercial objection review",
  scenario: "commercial_review",
  fictional_account_name: "Morrowglass Hospitality",
  call_date: "2026-06-24",
  language: "en",
  participants: [
    { participant_id: "c-seller", fictional_name: "Talia Reed", fictional_title: "Account Director", side: "seller" },
    { participant_id: "c-daria", fictional_name: "Daria Pell", fictional_title: "Chief Operating Officer", side: "customer" },
    { participant_id: "c-jon", fictional_name: "Jon Brume", fictional_title: "Procurement Manager", side: "customer" },
  ],
  turns: [
    { turn_id: "c-01", participant_id: "c-daria", text: "The workflow case for LedgerLift is strong, but the fictional proposal is 14,000 dollars above the amount we reserved." },
    { turn_id: "c-02", participant_id: "c-jon", text: "The annual proposal is 96,000 fictional dollars. Our approved ceiling is 82,000, and we cannot expand that ceiling this quarter." },
    { turn_id: "c-03", participant_id: "c-seller", text: "Would phasing the analytics module after the first quarter solve the timing issue without changing the core rollout?" },
    { turn_id: "c-04", participant_id: "c-daria", text: "Potentially. The core need is standardized handoffs across twelve fictional properties before the autumn planning cycle." },
    { turn_id: "c-05", participant_id: "c-jon", text: "We also need a two-year price cap and the termination language clarified. Those are procurement conditions, not optional requests." },
    { turn_id: "c-06", participant_id: "c-seller", text: "I will return with a phased option, a two-year price-cap proposal, and clarified termination language by June 29." },
    { turn_id: "c-07", participant_id: "c-daria", text: "If the first-year amount is within 82,000 and those terms are acceptable, I am prepared to recommend signature by July 15." },
    { turn_id: "c-08", participant_id: "c-jon", text: "Procurement will review the revision within three business days. No final commitment is made until that review is complete." },
  ],
};

const commercialAnalysis = finalize(commercialTranscript, {
  crm: {
    account: { name: "Morrowglass Hospitality", industry: "Fictional hospitality operations", location: "Twelve-property fictional portfolio" },
    contacts: [
      { name: "Daria Pell", title: "Chief Operating Officer", email: "daria.pell@example.com", role: "decision_maker" },
      { name: "Jon Brume", title: "Procurement Manager", email: "jon.brume@example.com", role: "procurement" },
      { name: "Talia Reed", title: "Account Director", email: "talia.reed@example.com", role: "seller" },
    ],
    opportunity: {
      name: "Property handoff standardization", stage: "negotiation", use_case: "Standardize operating handoffs across twelve fictional properties",
      products_or_services: ["LedgerLift", "Core workflow", "Analytics module"], amount: { value: 96000, currency: "USD" },
      expected_close_date: "2026-07-15", next_step: "Send revised phased commercial option by 2026-06-29",
    },
    activity: {
      type: "sales_call", subject: "Commercial objection and revised option", occurred_at: "2026-06-24", duration_minutes: 42,
      participant_names: ["Talia Reed", "Daria Pell", "Jon Brume"],
      concise_notes: "Customer supports the workflow case but requires an 82,000 first-year ceiling, price protection, and clarified termination language.",
    },
  },
  intelligence: {
    executive_summary: "Morrowglass Hospitality affirmed the operational case for LedgerLift but rejected the 96,000 fictional-dollar first-year proposal because it exceeds an approved 82,000 ceiling. The team is open to phasing analytics after the first quarter while preserving the core rollout across twelve fictional properties. Procurement also requires a two-year price cap and clarified termination language. Talia Reed will deliver a revised option by June 29. Daria Pell may recommend signature by July 15 if price and terms are acceptable; procurement review remains a condition.",
    customer_goals: ["Standardize handoffs across twelve properties before autumn planning", "Keep first-year spend within 82,000 fictional dollars"],
    pain_points: [{ description: "Current property handoffs are not standardized", business_impact: "Creates risk before the autumn planning cycle", priority: "high" }],
    requirements: [
      { description: "First-year amount at or below 82,000 fictional dollars", type: "commercial", support: "direct" },
      { description: "Two-year price cap", type: "commercial", support: "direct" },
      { description: "Clarified termination language", type: "legal", support: "direct" },
    ],
    objections: [
      { description: "Proposal exceeds the approved first-year ceiling by 14,000 fictional dollars", category: "price", resolution_status: "open" },
      { description: "Price protection and termination language are unresolved", category: "legal", resolution_status: "open" },
    ],
    competitors_mentioned: [],
    qualification: {
      budget: { status: "confirmed", detail: "Approved ceiling is 82,000 fictional dollars; current proposal is 96,000." },
      authority: { status: "confirmed", detail: "Daria can recommend signature; procurement must approve revised terms." },
      need: { status: "confirmed", detail: "Core rollout is needed before the autumn planning cycle." },
      timeline: { status: "confirmed", detail: "Revision due June 29; conditional signature target July 15." },
    },
    sentiment: { overall: "mixed", explanation: "Operational support is strong, while price and legal conditions remain explicit blockers." },
    risks: [
      { description: "Revised pricing may still exceed the approved ceiling", severity: "high", suggested_mitigation: "Separate the analytics module and show first-year versus later-phase economics." },
      { description: "Procurement terms could delay the July target", severity: "medium", suggested_mitigation: "Provide redlined termination language with the revised proposal." },
    ],
  },
  follow_up: {
    tasks: [
      { task_id: "c-task-1", title: "Send phased commercial option", description: "Keep the core rollout intact and phase analytics after the first quarter.", owner_role: "seller", due_date: "2026-06-29", priority: "high", source: "explicit_commitment" },
      { task_id: "c-task-2", title: "Propose two-year price cap", description: "Include the cap in the revised terms.", owner_role: "seller", due_date: "2026-06-29", priority: "high", source: "explicit_commitment" },
      { task_id: "c-task-3", title: "Review revised commercial package", description: "Complete procurement review within three business days of receipt.", owner_role: "customer", due_date: null, priority: "high", source: "explicit_commitment" },
    ],
    email: {
      subject: "Morrowglass | revised phased commercial option",
      body: "Hi Daria and Jon,\n\nThank you for the direct feedback. I captured the required revision as a first-year option within the 82,000 fictional-dollar ceiling, with analytics phased after the first quarter, a two-year price cap, and clarified termination language.\n\nI’ll send the revised package by June 29 for procurement review. No final commitment is assumed before that review is complete.\n\nBest,\nTalia",
      tone: "professional", requires_human_review: true,
    },
  },
  quality: {
    overall_simulated_confidence: 0.98,
    missing_critical_fields: [],
    warnings: [
      { warning_id: "c-warn-1", field_path: "/crm/opportunity/expected_close_date", severity: "warning", message: "July 15 is a conditional recommendation target, not a committed signature date." },
      { warning_id: "c-warn-2", field_path: "/crm/opportunity/amount", severity: "info", message: "The current 96,000 proposal and the 82,000 approved ceiling should remain distinct." },
    ],
    evidence: [
      evidence("c-ev-1", "/intelligence/objections/0", "c-01", "the fictional proposal is 14,000 dollars above the amount we reserved"),
      evidence("c-ev-2", "/intelligence/qualification/budget", "c-02", "Our approved ceiling is 82,000"),
      evidence("c-ev-3", "/intelligence/customer_goals/0", "c-04", "standardized handoffs across twelve fictional properties before the autumn planning cycle"),
      evidence("c-ev-4", "/intelligence/requirements/1", "c-05", "a two-year price cap and the termination language clarified"),
      evidence("c-ev-5", "/crm/opportunity/expected_close_date", "c-07", "prepared to recommend signature by July 15", "inferred", 0.82),
      evidence("c-ev-6", "/quality/warnings/0", "c-08", "No final commitment is made until that review is complete", "direct", 0.99),
    ],
  },
});

export const scenarios: DemoScenario[] = [
  { transcript: discoveryTranscript, analysis: discoveryAnalysis, eyebrow: "Discovery", summary: "Fragmented store operations → five-site pilot", accent: "teal" },
  { transcript: qualificationTranscript, analysis: qualificationAnalysis, eyebrow: "Qualification", summary: "Funded hub expansion → decision path confirmed", accent: "violet" },
  { transcript: technicalTranscript, analysis: technicalAnalysis, eyebrow: "Technical evaluation", summary: "Security boundary → synthetic proof of concept", accent: "blue" },
  { transcript: commercialTranscript, analysis: commercialAnalysis, eyebrow: "Commercial objection", summary: "Price gap → phased negotiation", accent: "amber" },
];

