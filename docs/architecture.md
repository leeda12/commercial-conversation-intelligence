# Public Version 1 architecture

Public Version 1 is a static, deterministic simulation. A transcript selector passes a bundled transcript identifier to the provider-neutral `ConversationAnalyzer` contract. The only implementation, `PrecomputedConversationAnalyzer`, finds the matching bundled analysis, validates its transcript evidence, and returns an immutable copy for review.

The browser owns the temporary review state. Edits are never persisted and exports are produced with browser-native file APIs. Reloading the page restores the original bundled state.

## Runtime boundaries

- No API routes or server actions.
- No network analysis requests.
- No provider SDKs, model identifiers, API-key fields, or credential configuration.
- No database, browser storage, authentication, analytics, or tracking.
- No CRM, email, calendar, or workflow writes.
- No user-supplied transcript input.

## Main modules

- `src/domain/types.ts`: canonical transcript, analysis, and review contracts.
- `src/demo-data/scenarios.ts`: original fictional transcripts and precomputed analyses.
- `src/analyzers/conversation-analyzer.ts`: provider-neutral interface.
- `src/analyzers/precomputed-conversation-analyzer.ts`: deterministic implementation.
- `src/exports/exporters.ts`: pure JSON, CSV, and email export formatters.
- `src/components/demo-workspace.tsx`: in-memory review workflow.

The asynchronous analyzer interface intentionally preserves a clean architectural seam. Public Version 1 does not include or activate any live implementation of that seam.

