---
title: "Threat modeling"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Threat modeling is a structured examination of how a system could be misused and what design changes would reduce the resulting risk. It starts from assets, actors, data flows and trust boundaries, then turns plausible attacks into explicit mitigations and verification work.

The deliverable is not an impressive diagram or a complete catalog of imaginary attackers. It is a small set of important claims about the design: which inputs are untrusted, what authority a component holds, which bad outcomes matter and how those outcomes are prevented or detected.

## Why it matters for backend engineers

Normal feature tests demonstrate intended behavior. They rarely ask whether a customer can direct a backend downloader toward an internal service, whether a support account can cross tenant boundaries, or whether a queue message can trigger privileged work.

These problems are easier to address before interfaces and deployment permissions become fixed. A short design discussion may reveal that a worker does not need internet access or production credentials at all. Removing unnecessary authority is often more reliable than adding validation around it later.

## How it works

Choose a bounded scope, such as a new import workflow, and describe what must be protected: customer files, credentials, tenant isolation and service capacity. Identify relevant actors, including authenticated customers, compromised workloads and privileged operators.

Draw the actual flow of data and control. Include stores, queues, external services and administrative paths. At each boundary, ask who controls the input and what new authority becomes available. Crossing a trust boundary means a change in authority or trust assumptions; two processes in the same subnet can still sit on opposite sides of one.

Describe concrete abuse paths. “An attacker supplies a callback URL that causes the worker to contact an internal metadata endpoint” is more actionable than “SSRF risk.” Identify prerequisites, impact and the control expected to break the path.

Record an owner and a way to verify each important mitigation. Some risks remain accepted under stated assumptions; write those assumptions down. Revisit them when the workflow gains a new parser, new credentials or a broader set of callers.

## Key concepts

**Assets include authority and capacity.** Protecting documents matters, but so does preventing access to a signing key or exhausting every worker. Data confidentiality is only one possible consequence.

**Attacker capabilities must be explicit.** A malicious authenticated customer can submit valid requests that an anonymous outsider cannot. A compromised worker can use its runtime identity even if it cannot change source code.

**Threat categories are prompts, not answers.** Frameworks such as STRIDE help ask about impersonation, tampering, repudiation, disclosure, denial of service and privilege escalation. The useful output still needs a system-specific path and control.

**Mitigations have assumptions.** An allowlist is only as strong as how destinations are resolved and used. Encryption protects a channel but does not authorize the receiver. Review the mechanism rather than accepting a control's name.

**Residual risk is a decision.** State what remains possible, who accepts it and which change requires reconsideration. “Low risk” without a reason cannot guide later engineers.

## Production example

A proposed document-import service accepts a URL, downloads a file, extracts its contents and stores a searchable representation. The happy path works in a prototype. A focused review follows the input through the downloader, parser, temporary storage and indexer.

Three independent threats emerge. First, a supplied URL could target internal infrastructure. Second, a malformed document could exploit or crash the parser. Third, a small compressed file could expand enough to exhaust disk or memory. Calling all three “validate input” would hide their different mechanisms.

The design restricts downloader destinations and egress, handles redirects under the same policy, and runs parsing with limited permissions and resource budgets. It limits downloaded bytes, expanded bytes and processing duration separately. Tenant identity comes from trusted job metadata rather than a field inside the downloaded document.

Verification includes disallowed destinations, redirect chains, oversized expansion and a parser crash. The team checks that a crashed job releases its temporary storage and cannot block the whole queue. The review also records that adding a new document format requires revisiting parser isolation and resource assumptions.

The outcome is a changed design and concrete tests. The diagram remains useful because it points to those decisions, not because its existence proves that the service is secure.

## Trade-offs

Focused modeling improves design while the cost of change is low. Excessively broad sessions can become speculative and delay implementation without identifying better controls. Time-box the discussion around a real boundary or important change.

People also have different expertise. A backend engineer may understand the queue but miss identity-provider behavior; a security specialist may identify an attack but need help tracing actual privileges. Collaborative review is valuable when it connects these perspectives to implementation ownership.

## Failure modes / pitfalls

**Only external attackers are considered.** Include authenticated misuse, compromised services and privileged automation relevant to the system.

**The diagram omits operational paths.** Support tools, exports, restore procedures and CI often hold more authority than the main request path.

**Controls are listed without verification.** “Use encryption” or “add validation” is not an acceptance criterion. Name the protected boundary and test the expected rejection or containment.

**The model never changes.** New integrations or privileges can invalidate old assumptions even when the original feature name stays the same.

**Every risk is assigned to security.** Engineers who own the affected code or infrastructure must own implementing and maintaining the mitigation.

## When to use it

Use threat modeling for new trust boundaries, sensitive data flows, privileged automation and significant changes to who can invoke a capability. It is particularly useful for uploads, callbacks, multi-tenant access and features that run external content or tools.

A practical session can start with one workflow, one page of flows and the question: “What can this caller make our system do with authority the caller does not have directly?” Follow the most consequential answers into concrete controls.

## When not to use it

Do not postpone an obvious vulnerability fix until a comprehensive model is finished. Apply the known mitigation and use modeling to identify related gaps.

Do not run a large formal exercise for every cosmetic change. Scale the effort to changed authority, exposure and consequences. Reuse prior models when their assumptions still hold, while explicitly checking what the change affects.

## What a Senior Engineer should know

A Senior Engineer should trace untrusted input to privileged behavior, identify the assumptions at each boundary and propose mechanisms that break plausible attacks. They should turn those mechanisms into tests and observable operational behavior.

They should explain residual uncertainty honestly. A parser sandbox may contain some consequences without making the parser bug disappear; a rate limit may reduce abuse without making an expensive operation affordable at every scale.

## What a Staff Engineer should understand

A Staff Engineer should identify repeated risky boundaries across teams and invest in supported patterns, such as constrained downloaders or tenant-scoped data access. This reduces the need for every team to rediscover the same failure modes.

Ensure consequential residual risks have accountable decision makers and that major architectural changes trigger review. Measure whether modeling changes designs and closes risks, rather than counting completed diagrams or meetings.

Further reading: [OWASP threat modeling](https://owasp.org/www-community/Threat_Modeling).
