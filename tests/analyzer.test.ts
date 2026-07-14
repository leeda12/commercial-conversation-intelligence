import { describe, expect, it } from "vitest";
import { precomputedConversationAnalyzer } from "@/src/analyzers/precomputed-conversation-analyzer";
import { scenarios } from "@/src/demo-data/scenarios";
import { analysisSchema, transcriptSchema } from "@/src/domain/schemas";

describe("precomputed demo analyzer", () => {
  it("contains four meaningfully different fictional scenario types", () => {
    expect(scenarios).toHaveLength(4);
    expect(new Set(scenarios.map((scenario) => scenario.transcript.scenario))).toEqual(
      new Set(["discovery", "qualification", "technical_evaluation", "commercial_review"]),
    );
  });

  it("validates every bundled transcript, analysis, and exact evidence mapping", () => {
    for (const scenario of scenarios) {
      expect(transcriptSchema.parse(scenario.transcript)).toEqual(scenario.transcript);
      expect(analysisSchema.parse(scenario.analysis)).toEqual(scenario.analysis);
      expect(scenario.analysis.simulation.transcript_id).toBe(scenario.transcript.transcript_id);
      for (const item of scenario.analysis.quality.evidence) {
        const turn = scenario.transcript.turns.find((candidate) => candidate.turn_id === item.turn_id);
        expect(turn).toBeDefined();
        expect(turn?.text.slice(item.start_character, item.end_character)).toBe(item.quote);
      }
    }
  });

  it("returns independent deterministic copies rather than the bundled object", async () => {
    const id = scenarios[0].transcript.transcript_id;
    const first = await precomputedConversationAnalyzer.analyze({ transcript_id: id });
    const second = await precomputedConversationAnalyzer.analyze({ transcript_id: id });
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    first.crm.account.name = "Edited fictional account";
    expect(second.crm.account.name).toBe("Thistle & Byte Markets");
  });

  it("rejects an unknown transcript identifier", async () => {
    await expect(precomputedConversationAnalyzer.analyze({ transcript_id: "not-a-bundled-example" })).rejects.toThrow("Unknown bundled fictional transcript");
  });
});

