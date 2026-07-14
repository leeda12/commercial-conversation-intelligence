export type ScenarioKind =
  | "discovery"
  | "qualification"
  | "technical_evaluation"
  | "commercial_review";

export type SyntheticTranscript = {
  schema_version: "1.0";
  transcript_id: string;
  title: string;
  scenario: ScenarioKind;
  fictional_account_name: string;
  call_date: string;
  language: "en";
  participants: Array<{
    participant_id: string;
    fictional_name: string;
    fictional_title: string;
    side: "seller" | "customer";
  }>;
  turns: Array<{
    turn_id: string;
    participant_id: string;
    text: string;
  }>;
};

export type QualificationSignal = {
  status: "confirmed" | "inferred" | "not_discussed";
  detail: string | null;
};

export type Evidence = {
  evidence_id: string;
  field_path: string;
  turn_id: string;
  quote: string;
  start_character: number;
  end_character: number;
  support: "direct" | "inferred";
  simulated_confidence: number;
};

export type ConversationAnalysis = {
  schema_version: "1.0";
  simulation: {
    mode: "precomputed_demo";
    transcript_id: string;
    analysis_version: string;
    notice: "Simulated AI workflow using a precomputed fictional example.";
  };
  crm: {
    account: { name: string | null; industry: string | null; location: string | null };
    contacts: Array<{
      name: string;
      title: string | null;
      email: string | null;
      role:
        | "decision_maker"
        | "champion"
        | "influencer"
        | "end_user"
        | "technical"
        | "procurement"
        | "legal"
        | "seller"
        | "unknown";
    }>;
    opportunity: {
      name: string | null;
      stage:
        | "discovery"
        | "qualification"
        | "evaluation"
        | "proposal"
        | "negotiation"
        | "closed_won"
        | "closed_lost"
        | "unknown";
      use_case: string | null;
      products_or_services: string[];
      amount: { value: number; currency: string } | null;
      expected_close_date: string | null;
      next_step: string | null;
    };
    activity: {
      type: "sales_call";
      subject: string;
      occurred_at: string | null;
      duration_minutes: number | null;
      participant_names: string[];
      concise_notes: string;
    };
  };
  intelligence: {
    executive_summary: string;
    customer_goals: string[];
    pain_points: Array<{
      description: string;
      business_impact: string | null;
      priority: "high" | "medium" | "low" | "unknown";
    }>;
    requirements: Array<{
      description: string;
      type:
        | "business"
        | "technical"
        | "security"
        | "legal"
        | "commercial"
        | "implementation"
        | "unknown";
      support: "direct" | "inferred";
    }>;
    objections: Array<{
      description: string;
      category:
        | "price"
        | "timing"
        | "technical"
        | "security"
        | "legal"
        | "competition"
        | "authority"
        | "other";
      resolution_status: "resolved" | "open" | "unclear";
    }>;
    competitors_mentioned: string[];
    qualification: {
      budget: QualificationSignal;
      authority: QualificationSignal;
      need: QualificationSignal;
      timeline: QualificationSignal;
    };
    sentiment: {
      overall: "positive" | "neutral" | "negative" | "mixed" | "unknown";
      explanation: string;
    };
    risks: Array<{
      description: string;
      severity: "high" | "medium" | "low";
      suggested_mitigation: string | null;
    }>;
  };
  follow_up: {
    tasks: Array<{
      task_id: string;
      title: string;
      description: string | null;
      owner_role: "seller" | "customer" | "shared" | "unknown";
      due_date: string | null;
      priority: "high" | "medium" | "low";
      source: "explicit_commitment" | "suggested";
    }>;
    email: {
      subject: string;
      body: string;
      tone: "professional";
      requires_human_review: true;
    };
  };
  quality: {
    overall_simulated_confidence: number;
    missing_critical_fields: string[];
    warnings: Array<{
      warning_id: string;
      field_path: string | null;
      severity: "info" | "warning";
      message: string;
    }>;
    evidence: Evidence[];
  };
};

export type DemoScenario = {
  transcript: SyntheticTranscript;
  analysis: ConversationAnalysis;
  eyebrow: string;
  summary: string;
  accent: "teal" | "violet" | "blue" | "amber";
};

export type ReviewSession = {
  transcript_id: string;
  working_copy: ConversationAnalysis;
  review_status: "unreviewed" | "in_review" | "reviewed";
  edited_field_paths: string[];
};

