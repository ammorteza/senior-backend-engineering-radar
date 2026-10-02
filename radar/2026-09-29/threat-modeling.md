---
title: "Threat modeling"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Threat modeling examines assets, entry points, trust boundaries and plausible attacker actions during design. It turns security discussion into specific risks and testable controls.

## Why it matters for backend engineers

A design can pass normal tests while allowing one tenant to influence another's data or a webhook URL to reach internal infrastructure. Architecture review is the right time to discover those paths.

## How it works

Draw the data flow and identify who controls each input and component. Describe attacker goals and capabilities, then explore threats such as spoofing, tampering, disclosure and denial of service. Prioritize mitigations by impact and plausible exposure. Record residual risks and revisit the model when boundaries change.

## Key concepts

An asset can be data, credentials or service capacity. A trust boundary marks a change in authority, not merely a network hop. Abuse cases supplement happy-path use cases. Mitigations need owners and verification, not just diagram labels.

## Production example

A document-import feature downloads a URL and parses the content. The model identifies SSRF, parser exploitation and oversized input as distinct threats. Network restrictions, parser isolation and size/time budgets address separate paths. Tests include redirects and decompression expansion.

## Trade-offs

Focused modeling catches design flaws cheaply. Excessive checklists or unsupported attacker assumptions can consume time without improving decisions.

## Failure modes / pitfalls

Modeling only external attackers, ignoring privileged automation and leaving mitigations untested turn the exercise into paperwork.

## When to use it

Use threat modeling for new trust boundaries, sensitive data flows and consequential architecture changes.

## When not to use it

Do not postpone obvious fixes while constructing an elaborate model; scale the exercise to the change.

## What a Senior Engineer should know

Trace controlled input to privileged effects and propose concrete tests.

## What a Staff Engineer should understand

Define reusable boundary patterns and ensure high-impact residual risks have accountable owners.

Further reading: [OWASP threat modeling](https://owasp.org/www-community/Threat_Modeling).
