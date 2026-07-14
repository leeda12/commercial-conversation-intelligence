# Optional private live-AI boundary

Live analysis is outside Public Version 1. The public source tree contains no live provider adapter, provider SDK, model identifier, API route, credential field, or runtime configuration for live analysis.

A private live implementation would require a separate architecture, privacy review, threat model, evaluation plan, credential-handling design, and explicit project approval before any code or configuration is added. The provider-neutral `ConversationAnalyzer` interface is the only extension seam reserved for that possible future review.

