import type { ConversationAnalyzer, ConversationAnalysisRequest } from "@/src/analyzers/conversation-analyzer";
import { scenarios } from "@/src/demo-data/scenarios";
import { analysisSchema, transcriptSchema } from "@/src/domain/schemas";
import type { ConversationAnalysis } from "@/src/domain/types";

export class PrecomputedConversationAnalyzer implements ConversationAnalyzer {
  async analyze(request: ConversationAnalysisRequest): Promise<ConversationAnalysis> {
    const scenario = scenarios.find((item) => item.transcript.transcript_id === request.transcript_id);
    if (!scenario) throw new Error("Unknown bundled fictional transcript.");

    transcriptSchema.parse(scenario.transcript);
    analysisSchema.parse(scenario.analysis);
    if (scenario.analysis.simulation.transcript_id !== scenario.transcript.transcript_id) {
      throw new Error("Bundled transcript and analysis identifiers do not match.");
    }

    for (const evidence of scenario.analysis.quality.evidence) {
      const turn = scenario.transcript.turns.find((item) => item.turn_id === evidence.turn_id);
      if (!turn) throw new Error(`Unknown evidence turn: ${evidence.turn_id}`);
      if (turn.text.slice(evidence.start_character, evidence.end_character) !== evidence.quote) {
        throw new Error(`Evidence offset mismatch: ${evidence.evidence_id}`);
      }
    }

    return structuredClone(scenario.analysis);
  }
}

export const precomputedConversationAnalyzer = new PrecomputedConversationAnalyzer();

