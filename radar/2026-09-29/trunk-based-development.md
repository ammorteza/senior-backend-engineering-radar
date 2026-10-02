---
title: "Trunk-based development"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Trunk-based development integrates small changes into a shared mainline frequently. Short-lived branches, automated checks and release controls reduce the cost of long-delayed integration.

## Why it matters for backend engineers

Long-lived feature branches accumulate conflicts and hide compatibility problems. Frequent integration exposes those problems while changes are still small enough to understand.

## How it works

Engineers make bounded changes, run relevant checks and merge quickly through the team's review process. Incomplete user-facing behavior can remain behind a feature flag or abstraction seam. The mainline should stay releasable, with failures fixed or reverted promptly. Trunk-based development does not imply abandoning review.

## Key concepts

Small batch size helps review and rollback. Branch lifetime matters more than a branching tool's name. Branch-by-abstraction supports internal migrations. Deployment frequency and feature release remain separate decisions.

## Production example

A team replaces a storage adapter through an interface. Each small merge adds tests or migrates one call site while the old adapter remains usable. The final switch is controlled and the obsolete path removed. This avoids a month-long branch requiring a giant integration review.

## Trade-offs

Frequent integration reduces merge risk. It depends on effective checks and compatible incremental design; poor tests make the mainline unstable faster.

## Failure modes / pitfalls

Merging large unreviewed changes, broken mainline tolerated for days and permanent hidden features undermine the practice.

## When to use it

Use trunk-based development when teams can deliver small compatible steps with rapid feedback.

## When not to use it

Do not equate it with pushing directly to production without safeguards or forcing unfinished destructive changes onto mainline.

## What a Senior Engineer should know

Split work into reviewable increments and use flags or seams responsibly.

## What a Staff Engineer should understand

Improve CI feedback, review flow and release policy so frequent integration is sustainable.

Further reading: [Trunk Based Development](https://trunkbaseddevelopment.com/).
