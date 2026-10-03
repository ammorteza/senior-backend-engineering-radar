# Teaching-depth review — completed 2026-10-03

**Complete: 148 of 148 radar articles reviewed individually. 145 were rewritten and reread; 3 were preserved unchanged after review; 0 remain pending.**

This audit replaced the earlier template-removal standard with a teaching standard. Passing structure, word-count or duplicate-text checks was not enough: each blip had to teach its own mechanism, operating consequences and failure modes well enough to be useful to a Senior backend engineer.

## Acceptance criteria

Every article was reviewed against these criteria:

- Preserve the eleven required headings and existing radar metadata.
- Explain mechanisms and causal relationships, not only terminology.
- Define important terms before relying on them and distinguish nearby concepts that engineers commonly confuse.
- Give a topic-specific production scenario with decisions, consequences and concrete verification evidence.
- Explain trade-offs and failure causes sufficiently for a reader to act on them.
- Make Senior and Staff expectations concrete and different in scope.
- Remove filler that could be pasted into an unrelated article.
- Treat word count and duplicate scans as supporting signals, never as editorial acceptance tests.
- Verify evolving or subtle claims against current primary documentation where practical.
- Keep illustrative examples distinct from documented incidents or vendor guarantees.

## Review outcome

The earlier part of this audit had already reviewed 46 articles: 45 were rewritten and [Managed relational databases](../radar/2026-09-29/managed-relational-databases.md) was preserved.

The completion pass reviewed the remaining 102 articles one by one. 100 required substantive rewrites. Two already met the new teaching standard and were preserved byte-for-byte:

- [Distributed systems fundamentals](../radar/2026-09-29/distributed-systems-fundamentals.md)
- [Make / task runners](../radar/2026-09-29/make-task-runners.md)

The completed radar therefore contains **145 rewritten articles and 3 preserved articles**.

## What changed in the completion pass

The rewrites were intentionally topic-specific rather than generated from one prose template.

- API and networking articles now distinguish API behavior from schemas, edge policy from domain authorization, DNS caching from connection lifetime, HTTP semantics from transport versions, and SSE/WebSocket replay from durable messaging.
- Distributed-systems articles now work through concrete invariants, replication guarantees, quorum and Raft behavior, causality, fencing, CRDT merge semantics and CQRS projection recovery instead of repeating generic consistency language.
- Reliability articles now separate deadlines, retries, circuit breaking, admission control, bounded queues, degradation and capacity planning, with overload and recovery math where it materially helps.
- Observability and performance articles now distinguish metrics, tracing, OpenTelemetry, Prometheus, Grafana, pprof, Go execution tracing, eBPF, Linux/cgroup evidence, load models and debugger use by the questions each tool can actually answer.
- Language and tooling articles now teach Go lifetime/cancellation and slice behavior, Python execution models, shell expansion and failure semantics, regex engine guarantees, Git object/history recovery, CI trust boundaries and dev-environment reproducibility.
- Cloud and platform articles now make identity, networking, quotas, failure domains, serverless scaling, container lifecycle, Kubernetes reconciliation/probes/resources, Helm rollback limits, local-cluster fidelity, Terraform/OpenTofu state and platform ownership explicit.
- Architecture and delivery articles now distinguish semantic boundaries (DDD), in-process modular ownership, independent-service boundaries, strangler migration authority, feature-flag state, progressive production evidence, trunk-based integration, workflow durability, Temporal replay, streaming event time, cost models and delivery-flow metrics.
- AI and agent articles now separate context selection, RAG retrieval quality, vector search, tool-schema validity, authorization, agent evaluation, observability, sandboxing, durable effect identity, coding-agent permissions, repository instructions, model routing, MCP protocol behavior and Agent Skills packaging.
- [WebAssembly](../radar/2026-09-29/webassembly.md) now teaches the runtime/capability boundary, WASI/runtime versioning and resource-bounded plugin execution rather than describing Wasm only as portable bytecode.

## Current-spec corrections made during review

The audit checked fast-moving claims instead of carrying forward older descriptions.

- TLS 1.3 references now point to RFC 9846, the July 2026 specification that obsoletes RFC 8446.
- The MCP article now describes the current 2026-07-28 stateless protocol core: no required initialize/initialized handshake or protocol-level session for the modern era, per-request protocol metadata, optional server/discover and explicit compatibility with older 2025-era clients.
- Prometheus native histograms are described using current stable-version behavior rather than their older experimental-only status.
- DORA uses the current five software-delivery metrics, including deployment rework rate.
- AI tool-calling and agent-platform articles distinguish provider schema guarantees from application authorization and keep rapidly changing protocol/provider details explicitly versioned.

## Validation

A dedicated temporary GitHub Actions validation workflow ran against the completed article set on 2026-10-03.

Results:

- **148 article files** found.
- All 148 preserve the exact eleven required section headings in the required order.
- Frontmatter contains the expected title, ring, segment and tags metadata.
- No temporary placeholder characters remain.
- Exact repeated prose paragraphs of 20 or more words across different articles: **0 groups**.
- Article body word-count range: **686–1,595 words**; median: **915 words**. These numbers are reported only as a depth sanity check, not as acceptance criteria.
- `git diff --check` passed.
- `npm install` passed.
- `npm run build` / strict radar build passed.
- Static generation completed for **158/158 pages**.
- The normal GitHub Pages build and deployment also completed successfully after the final content correction.

No claim is made that prose length proves teaching quality; the repository-wide editorial review was performed article by article, and the automated checks verify only structural/build regressions around that review.

## Pending review

None. This teaching-depth audit is complete.
