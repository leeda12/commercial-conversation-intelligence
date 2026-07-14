import { z } from "zod";

const nullableText = z.string().nullable();
const qualification = z.object({
  status: z.enum(["confirmed", "inferred", "not_discussed"]),
  detail: nullableText,
}).strict();

export const transcriptSchema = z.object({
  schema_version: z.literal("1.0"),
  transcript_id: z.string().min(1),
  title: z.string().min(1),
  scenario: z.enum(["discovery", "qualification", "technical_evaluation", "commercial_review"]),
  fictional_account_name: z.string().min(1),
  call_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  language: z.literal("en"),
  participants: z.array(z.object({
    participant_id: z.string().min(1),
    fictional_name: z.string().min(1),
    fictional_title: z.string().min(1),
    side: z.enum(["seller", "customer"]),
  }).strict()).min(2),
  turns: z.array(z.object({
    turn_id: z.string().min(1),
    participant_id: z.string().min(1),
    text: z.string().min(1),
  }).strict()).min(1),
}).strict();

const evidenceSchema = z.object({
  evidence_id: z.string(),
  field_path: z.string().startsWith("/"),
  turn_id: z.string(),
  quote: z.string().min(1),
  start_character: z.number().int().nonnegative(),
  end_character: z.number().int().positive(),
  support: z.enum(["direct", "inferred"]),
  simulated_confidence: z.number().min(0).max(1),
}).strict();

export const analysisSchema = z.object({
  schema_version: z.literal("1.0"),
  simulation: z.object({
    mode: z.literal("precomputed_demo"),
    transcript_id: z.string(),
    analysis_version: z.string(),
    notice: z.literal("Simulated AI workflow using a precomputed fictional example."),
  }).strict(),
  crm: z.object({
    account: z.object({ name: nullableText, industry: nullableText, location: nullableText }).strict(),
    contacts: z.array(z.object({
      name: z.string(), title: nullableText, email: nullableText,
      role: z.enum(["decision_maker", "champion", "influencer", "end_user", "technical", "procurement", "legal", "seller", "unknown"]),
    }).strict()),
    opportunity: z.object({
      name: nullableText,
      stage: z.enum(["discovery", "qualification", "evaluation", "proposal", "negotiation", "closed_won", "closed_lost", "unknown"]),
      use_case: nullableText,
      products_or_services: z.array(z.string()),
      amount: z.object({ value: z.number(), currency: z.string().length(3) }).strict().nullable(),
      expected_close_date: nullableText,
      next_step: nullableText,
    }).strict(),
    activity: z.object({
      type: z.literal("sales_call"), subject: z.string(), occurred_at: nullableText,
      duration_minutes: z.number().nonnegative().nullable(), participant_names: z.array(z.string()), concise_notes: z.string(),
    }).strict(),
  }).strict(),
  intelligence: z.object({
    executive_summary: z.string(),
    customer_goals: z.array(z.string()),
    pain_points: z.array(z.object({ description: z.string(), business_impact: nullableText, priority: z.enum(["high", "medium", "low", "unknown"]) }).strict()),
    requirements: z.array(z.object({
      description: z.string(),
      type: z.enum(["business", "technical", "security", "legal", "commercial", "implementation", "unknown"]),
      support: z.enum(["direct", "inferred"]),
    }).strict()),
    objections: z.array(z.object({
      description: z.string(),
      category: z.enum(["price", "timing", "technical", "security", "legal", "competition", "authority", "other"]),
      resolution_status: z.enum(["resolved", "open", "unclear"]),
    }).strict()),
    competitors_mentioned: z.array(z.string()),
    qualification: z.object({ budget: qualification, authority: qualification, need: qualification, timeline: qualification }).strict(),
    sentiment: z.object({ overall: z.enum(["positive", "neutral", "negative", "mixed", "unknown"]), explanation: z.string() }).strict(),
    risks: z.array(z.object({ description: z.string(), severity: z.enum(["high", "medium", "low"]), suggested_mitigation: nullableText }).strict()),
  }).strict(),
  follow_up: z.object({
    tasks: z.array(z.object({
      task_id: z.string(), title: z.string(), description: nullableText,
      owner_role: z.enum(["seller", "customer", "shared", "unknown"]), due_date: nullableText,
      priority: z.enum(["high", "medium", "low"]), source: z.enum(["explicit_commitment", "suggested"]),
    }).strict()),
    email: z.object({ subject: z.string(), body: z.string(), tone: z.literal("professional"), requires_human_review: z.literal(true) }).strict(),
  }).strict(),
  quality: z.object({
    overall_simulated_confidence: z.number().min(0).max(1),
    missing_critical_fields: z.array(z.string()),
    warnings: z.array(z.object({ warning_id: z.string(), field_path: z.string().nullable(), severity: z.enum(["info", "warning"]), message: z.string() }).strict()),
    evidence: z.array(evidenceSchema),
  }).strict(),
}).strict();

