import { describe, expect, it } from "vitest";
import { scenarios } from "@/src/demo-data/scenarios";
import { buildCrmCsv, buildEmailExport, buildJsonExport, buildTaskCsv } from "@/src/exports/exporters";

describe("browser-only exporters", () => {
  const analysis = structuredClone(scenarios[1].analysis);

  it("adds the simulation disclosure and review metadata to JSON", () => {
    const json = buildJsonExport(analysis, ["/crm/account/name"], "reviewed");
    const parsed = JSON.parse(json);
    expect(parsed.simulation_notice).toContain("precomputed fictional example");
    expect(parsed.review.status).toBe("reviewed");
    expect(parsed.review.edited_field_paths).toContain("/crm/account/name");
  });

  it("produces a CRM CSV with fictional contact data", () => {
    const output = buildCrmCsv(analysis);
    expect(output).toContain('"record_type","field","value"');
    expect(output).toContain('"priya.moss@example.com"');
    expect(output).toContain('"118000"');
  });

  it("produces task CSV and local-review email text", () => {
    expect(buildTaskCsv(analysis)).toContain('"task_id","title","description"');
    expect(buildTaskCsv(analysis)).toContain("Send value model");
    expect(buildEmailExport(analysis)).toMatch(/^SIMULATED FICTIONAL EXAMPLE/);
    expect(buildEmailExport(analysis)).toContain("Subject: Brindle Harbor");
  });

  it("escapes commas and quotation marks in editable values", () => {
    analysis.crm.account.name = 'Fictional, "Quoted" Account';
    const output = buildCrmCsv(analysis);
    expect(output).toContain('"Fictional, ""Quoted"" Account"');
  });
});

