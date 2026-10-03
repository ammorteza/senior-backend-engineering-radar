---
title: "Agent observability"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Agent observability records the externally visible execution of an AI-agent workflow: model invocations, retrieval, tool selection, tool arguments and results, retries, approvals, checkpoints, cost, latency, and final outcome.

It does **not** require or imply access to a model's hidden chain of thought. Operational diagnosis should rely on emitted actions, structured outcomes, explicit reasoning summaries where provided, and verifiable system state.

## Why it matters for backend engineers

An agent can fail for very different reasons: retrieval returned an obsolete document, the model selected the wrong tool, authorization rejected the call, a provider timed out, or the tool succeeded but the response was lost.

If telemetry records only the final answer, these mechanisms collapse into “agent gave a bad result.” Backend teams need enough structured evidence to identify which layer failed and whether the agent actually executed an effect.

## How it works

Assign a stable run or workflow identity. Within it, record attempts or steps for model calls, retrieval operations, and tool calls.

For each model invocation, record provider/model or deployment identity, timing, token or usage information where available, and high-level structured outcome. For each tool call, record the tool name, validated arguments or a redacted representation, authorization decision, execution status, latency, and effect identity.

Distinguish **proposed action** from **executed effect**. A model emitting `delete_record(id=42)` is not evidence that deletion happened. The tool layer should record whether it was denied, executed, timed out, or produced an unknown outcome.

Connect agent telemetry to task outcome and user feedback. Lower latency or token cost is not success if accuracy or completion worsens.

OpenTelemetry's GenAI semantic conventions can provide common attributes and operation names, but current GenAI conventions include development-stage areas; pin and review the conventions your organization actually emits rather than assume permanent field names.

## Key concepts

**Run and attempt.** A user task can involve multiple model attempts, resumptions, branches, or retries. Preserve the relationship rather than flattening them.

**Tool outcome.** Accepted, rejected, failed, unknown, or completed are materially different states.

**Checkpoint identity.** Durable workflows should correlate resumed execution without creating a second business operation.

**Prompt and response privacy.** Full payload capture can contain source code, customer data, secrets, or retrieved documents. Metadata-only logging is safer but may reduce diagnostic detail.

**Cost attribution.** Model, provider, route, tool, and retries all influence cost. Attribute cost to completed tasks or workflows, not isolated API requests only.

## Production example

A policy assistant answers a customer with an obsolete refund rule.

The trace shows:
1. query received at 10:02;
2. retrieval used index version `policy-2026-09-01`;
3. the retrieved top document was superseded on 2026-09-20;
4. the model cited that document;
5. no policy API tool was invoked.

This narrows the mechanism to retrieval freshness, not model-provider outage or citation rendering.

The team fixes index invalidation and adds an evaluation case for historical policy versions. Telemetry records document IDs and version metadata but not unrestricted full document text in the broadly accessible operational log.

A different run requests an external mutation. The model proposes the call, the service authorization layer rejects it, and the trace records `authorization=denied`. Operators can therefore distinguish “the agent attempted an unsafe action” from “the system performed it.”

## Trade-offs

Detailed traces improve diagnosis, evaluation, and cost analysis. They increase storage, access-control, and privacy obligations.

Full prompts and tool payloads are highly informative but can contain sensitive information. Redaction reduces exposure while making some failures harder to reproduce.

High-cardinality agent traces belong in tracing or event systems; turning every user or prompt ID into a metric label creates telemetry cost problems.

## Failure modes / pitfalls

Logging secrets or entire private repositories into a shared telemetry backend creates a second data leak path.

Failing to distinguish proposed from executed actions produces misleading audit records. Losing run identity after resume makes one workflow look like multiple independent tasks.

A dashboard showing token count, latency, and tool calls without task success can reward efficient failure.

## When to use it

Instrument agent workflows whose tool use, cost, reliability, or operator support matters, especially for multi-step or consequential tasks.

Start with stable run identity, tool outcomes, versions, and task success before collecting every payload.

## When not to use it

Do not store every prompt and response indefinitely by default. Do not claim observability can reveal the model's complete internal reasoning.

For a short read-only assistant with no operational support requirement, simple application logging may be sufficient.

## What a Senior Engineer should know

A Senior Engineer should correlate model, retrieval, tool, authorization, and workflow events while redacting sensitive fields.

They should instrument unknown outcomes and retries explicitly and inspect the actual executed effects rather than trust agent narration.

## What a Staff Engineer should understand

A Staff Engineer should define telemetry schema, access, retention, sampling, privacy, and cost policy for agent systems and connect metrics to real task outcomes.

They should manage semantic-convention evolution and ensure observability supports incident response without becoming an uncontrolled archive of model inputs.

Further reading: [OpenTelemetry GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/).
