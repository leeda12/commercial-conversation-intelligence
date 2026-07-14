import type { ConversationAnalysis } from "@/src/domain/types";

export type ConversationAnalysisRequest = { transcript_id: string };

export interface ConversationAnalyzer {
  analyze(request: ConversationAnalysisRequest): Promise<ConversationAnalysis>;
}

