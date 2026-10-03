---
title: "Architecture Decision Records"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

An Architecture Decision Record (ADR) is a short, durable record of a consequential technical decision: the problem being solved, the constraints that mattered, the alternatives considered, the chosen option, and its expected consequences.

The value of an ADR is historical context. Code shows what exists; an ADR explains why the team chose it when several plausible options existed. That explanation becomes especially important after the original participants leave or the environment changes.

## Why it matters for backend engineers

Architecture decisions outlive meetings. Without a record, teams repeat old debates or interpret an intentional trade-off as accidental complexity.

A database choice, event-delivery guarantee, sharding strategy, authentication boundary, or migration approach often depends on constraints that are not visible in code. If those constraints disappear, the original decision may no longer be appropriate—but the team cannot evaluate that intelligently if the rationale was never preserved.

## How it works

Write the ADR close to the time of decision, while the alternatives and evidence are still fresh. Keep it concise enough to read during review.

A useful structure is:

- context and problem;
- decision drivers and constraints;
- considered options;
- chosen decision;
- positive and negative consequences;
- status and date;
- links to measurements, RFCs, incidents, or implementation.

The ADR records the decision rather than becoming a complete design document. Detailed schemas or rollout plans can live elsewhere and be linked.

Statuses such as Proposed, Accepted, Deprecated, or Superseded make authority visible. When a later decision changes the architecture, create a new ADR that supersedes the old one instead of rewriting history as though the original team never made the earlier choice.

## Key concepts

**Decision driver.** A requirement or constraint that differentiates alternatives: latency, team ownership, compliance, cost, migration risk, or operational maturity.

**Reversibility.** Easy-to-reverse decisions need less ceremony; hard-to-reverse choices deserve stronger evidence and migration thinking.

**Consequences.** Include costs and limitations, not only advantages. If an ADR reads like marketing for the selected option, it is not useful decision history.

**Superseding.** A later ADR can change the decision because constraints changed. The older record remains evidence of why the previous design was rational at the time.

**Evidence.** Benchmarks, incident data, cost estimates, or prototypes are stronger than generic statements such as “X scales better.”

## Production example

A document service must choose where to store generated PDFs. The team considers PostgreSQL bytea columns and object storage.

The ADR records that files are immutable after generation, typical size is 10–200 MB, downloads dominate access, and metadata must remain transactional with the business record. Object storage is chosen because large immutable blobs and direct download are a better fit.

The consequences include a new transaction boundary: committing metadata and uploading the object cannot happen in one PostgreSQL transaction. The design therefore writes under an immutable object key, verifies upload, and only then marks the database record ready.

Two years later, a new requirement says a legal hold must atomically prevent metadata and blob deletion. Engineers revisit the ADR. They do not conclude that object storage was “wrong”; they identify the original assumptions, add retention controls, and create a new ADR for the legal-hold model.

## Trade-offs

ADRs preserve reasoning at low cost and reduce repeated debate. Too much ceremony can turn them into approval paperwork and discourage recording decisions.

Very short records are easy to maintain but may omit the evidence needed later. Very long documents become design specifications that quickly drift from the implemented system.

## Failure modes / pitfalls

Writing ADRs after implementation often produces hindsight justification rather than real alternatives. Recording only the winner hides why other options were rejected.

An ADR for every library or refactor creates noise and makes important decisions hard to find. Conversely, one giant “architecture ADR” loses decision granularity.

Broken evidence links and ownerless repositories also make records decay.

## When to use it

Use ADRs for durable choices with meaningful trade-offs: service boundaries, data stores, messaging semantics, security boundaries, regional architecture, migration strategies, or organization-wide conventions.

Use lighter documentation for local implementation decisions that are easy to reverse.

## When not to use it

Do not require an ADR for every dependency upgrade or variable rename.

Do not use ADRs as a substitute for detailed design when implementation needs schemas, capacity models, API contracts, or rollout plans.

## What a Senior Engineer should know

A Senior Engineer should write ADRs that make constraints, alternatives, consequences, and implementation links clear enough for a future engineer to reassess the choice.

They should update status through superseding records rather than silently editing away historical reasoning.

## What a Staff Engineer should understand

A Staff Engineer should build a discoverable decision history across teams, identify which architectural choices deserve ADRs, and prevent the process from becoming central bureaucracy.

They should recognize when product, scale, cost, or organizational constraints have changed enough that an earlier decision should be revisited.

Further reading: [Documenting architecture decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
