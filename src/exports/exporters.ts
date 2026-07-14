import type { ConversationAnalysis } from "@/src/domain/types";

const csvCell = (value: unknown) => {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
};

const csv = (rows: unknown[][]) => rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

export function buildJsonExport(
  analysis: ConversationAnalysis,
  editedFieldPaths: string[],
  reviewStatus: "unreviewed" | "in_review" | "reviewed",
) {
  return JSON.stringify({
    export_version: "1.0",
    simulation_notice: analysis.simulation.notice,
    review: { status: reviewStatus, edited_field_paths: editedFieldPaths },
    analysis,
  }, null, 2);
}

export function buildCrmCsv(analysis: ConversationAnalysis) {
  const { account, opportunity, activity, contacts } = analysis.crm;
  const rows: unknown[][] = [
    ["record_type", "field", "value"],
    ["account", "name", account.name],
    ["account", "industry", account.industry],
    ["account", "location", account.location],
    ["opportunity", "name", opportunity.name],
    ["opportunity", "stage", opportunity.stage],
    ["opportunity", "use_case", opportunity.use_case],
    ["opportunity", "products_or_services", opportunity.products_or_services.join("; ")],
    ["opportunity", "amount", opportunity.amount?.value ?? null],
    ["opportunity", "currency", opportunity.amount?.currency ?? null],
    ["opportunity", "expected_close_date", opportunity.expected_close_date],
    ["opportunity", "next_step", opportunity.next_step],
    ["activity", "subject", activity.subject],
    ["activity", "occurred_at", activity.occurred_at],
    ["activity", "duration_minutes", activity.duration_minutes],
    ["activity", "concise_notes", activity.concise_notes],
  ];
  contacts.forEach((contact, index) => {
    rows.push(
      [`contact_${index + 1}`, "name", contact.name],
      [`contact_${index + 1}`, "title", contact.title],
      [`contact_${index + 1}`, "email", contact.email],
      [`contact_${index + 1}`, "role", contact.role],
    );
  });
  return csv(rows);
}

export function buildTaskCsv(analysis: ConversationAnalysis) {
  return csv([
    ["task_id", "title", "description", "owner_role", "due_date", "priority", "source"],
    ...analysis.follow_up.tasks.map((task) => [
      task.task_id, task.title, task.description, task.owner_role, task.due_date, task.priority, task.source,
    ]),
  ]);
}

export function buildEmailExport(analysis: ConversationAnalysis) {
  return `SIMULATED FICTIONAL EXAMPLE — HUMAN REVIEW REQUIRED\r\n\r\nSubject: ${analysis.follow_up.email.subject}\r\n\r\n${analysis.follow_up.email.body}`;
}

export function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

