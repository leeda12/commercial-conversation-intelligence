# Provider-neutral CRM integration architecture guide

This document describes a future, documentation-only integration boundary for reviewed fictional outputs. Public Version 1 does not connect to Dynamics 365, Salesforce, HubSpot, or any other external system; it requests no credentials and performs no external writes.

## Core principle: review before write

Only a human-approved `ApprovedConversationRecord` may enter an integration adapter. A raw or precomputed analysis cannot be written directly. The integration first creates a visible write plan, validates it, presents before-and-after values, and requires explicit approval.

```ts
interface CrmAdapter {
  findOrganizations(query: OrganizationMatchQuery): Promise<OrganizationCandidate[]>;
  findPeople(query: PersonMatchQuery): Promise<PersonCandidate[]>;
  buildWritePlan(record: ApprovedConversationRecord): Promise<CrmWritePlan>;
  validateWritePlan(plan: CrmWritePlan): Promise<ValidationResult>;
  executeApprovedPlan(
    plan: CrmWritePlan,
    approval: HumanApproval
  ): Promise<CrmWriteResult>;
}

type ApprovedConversationRecord = {
  approval_id: string;
  canonical_record: ReviewedConversationRecord;
  approved_field_paths: string[];
};
```

Platform-specific modules could implement this contract for Dynamics 365, Salesforce, or HubSpot while keeping matching, approval, idempotency, and audit rules in shared orchestration code.

## Authentication

Use OAuth 2.0 authorization for delegated access where supported and a narrowly scoped service identity only for approved server-to-server workflows. Tokens belong in a managed secret store, never browser storage, source code, logs, screenshots, or documentation. Prefer short-lived credentials, rotation, revocation, and separate identities per environment.

## Matching and duplicate prevention

Organization matching begins with normalized fictional names and fictional domains. Contact matching begins with normalized email and organization context. Exact unique matches may produce an update proposal; no match may produce a create proposal; multiple or fuzzy matches must stop for human resolution.

Example fictional match input:

```ts
const query: PersonMatchQuery = {
  full_name: "Mara Venn",
  email: "mara.venn@example.com",
  organization_name: "Thistle & Byte Markets",
};
```

Never allow a fuzzy match alone to authorize an update. Never replace an existing populated field with `null`, and compare normalized values before proposing a write.

## Canonical field mapping

Mappings remain provider-neutral until an adapter translates them to a reviewed target configuration.

| Reviewed canonical field | Fictional destination field |
|---|---|
| `crm.account.name` | `organization.display_name` |
| `crm.contacts[].name` | `person.full_name` |
| `crm.contacts[].email` | `person.primary_email` |
| `crm.opportunity.stage` | `deal.lifecycle_stage` |
| `crm.opportunity.amount.value` | `deal.estimated_value` |
| `crm.activity.concise_notes` | `engagement.reviewed_notes` |
| `follow_up.tasks[]` | `work_item.reviewed_actions` |

Adapters validate required fields, types, allowed values, lengths, currency codes, and date formats before producing a write plan. Unknown target fields or unsupported values block execution.

## Create-versus-update rules

1. One exact unique match: propose a field-level update.
2. No match: propose a new record with an explicit create label.
3. Multiple candidates: block and request human selection.
4. Conflicting identifiers: block and flag the conflict.
5. Empty source value: make no change unless a separately approved clear operation exists.

## Idempotency and audit trail

Every proposed operation receives a stable idempotency key derived from the approved source record, target system, target record, and operation type. Replaying a completed operation returns the recorded outcome rather than creating a duplicate.

A future audit record should capture the actor, approval, timestamp, target, proposed field changes, idempotency key, correlation ID, attempt count, and final result. Store only the reviewed fields needed for accountability, not the full transcript.

## Retry handling and failure recovery

Retry only transient transport, throttling, or temporary-service failures, using bounded exponential backoff. Do not retry authentication failures, validation failures, ambiguous matches, rejected approvals, or conflicting writes. Partial failures enter a reconciliation state that shows completed, failed, and untouched operations and supports a new human-approved retry plan.

After a successful write, read back the affected record where practical and compare the expected values. A mismatch becomes a recoverable validation failure rather than a silent success.

## Least privilege

Request only the permissions needed to search the approved object types and write the explicitly supported fields. Separate read-only matching from write execution where the platform permits it. Avoid administrative, bulk export, deletion, user-management, and unrelated object permissions.

## Validation and approval sequence

```text
Reviewed record → candidate matching → proposed mapping → validation
→ human before/after review → explicit approval → idempotency check
→ bounded write → read-back verification → audit result
```

## Webhook and workflow-trigger patterns

A future integration may begin from a manual UI action, an approved internal workflow event, or a signed webhook. Webhook handlers must verify signatures, timestamps, and replay identifiers before creating a pending plan. A trigger can request review but can never bypass human approval. Outbound notifications should reference a correlation ID and avoid transcript content.

## Failure-safe default

Any unknown mapping, missing approval, ambiguous identity, stale target version, permission mismatch, or unverifiable result stops the operation. The system should preserve the reviewed source, explain the failure clearly, and allow a human to correct and resubmit a new plan.

