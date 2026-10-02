---
title: "Agent security and sandboxing"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Agent security constrains how model-directed actions access data and affect systems. Sandboxing isolates execution, while authorization and validation restrict capabilities independently of the model's instructions.

## Why it matters for backend engineers

A retrieved document can contain malicious instructions. If the agent can read credentials and send arbitrary network requests, a prompt-injection mistake can become data exfiltration.

## How it works

Treat retrieved content and tool results as untrusted. Expose narrow operations, validate arguments and enforce permissions server-side. Execution environments restrict filesystem, processes and network destinations under an appropriate isolation model. Sensitive mutations may require a reviewable approval step under the product's policy. The model cannot grant itself authority.

## Key concepts

Prompt injection crosses data/instruction boundaries. Least privilege limits damage even when reasoning fails. Containers are not automatically strong hostile-code sandboxes. Egress control and scoped credentials address exfiltration separately from file access.

## Production example

An agent analyzing uploaded invoices encounters text asking it to fetch cloud credentials. Its tools expose invoice extraction and a draft operation, not arbitrary secret reads. Network policy blocks unapproved destinations. The service validates recipient and account context before any real financial action.

## Trade-offs

Restrictions reduce attack surface but can limit useful automation. Broader capabilities need proportionate isolation and audit, not merely a longer safety prompt.

## Failure modes / pitfalls

Shared privileged tokens, unrestricted shell access, tool results treated as instructions and approval of vague actions weaken protection.

## When to use it

Apply capability constraints whenever an agent uses tools or handles untrusted content.

## When not to use it

Do not rely on model refusal behavior as the only security boundary.

## What a Senior Engineer should know

Identify reachable credentials and effects; test malicious content against enforced permissions.

## What a Staff Engineer should understand

Design authority, isolation and audit around worst-case tool misuse, including compromised integrations.

Further reading: [MCP security best practices](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices).
