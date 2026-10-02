---
title: "Multi-region architecture"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Multi-region architecture places service capabilities in more than one geographic region. Active-passive and active-active designs differ in traffic handling, write ownership and recovery guarantees.

## Why it matters for backend engineers

Regional redundancy can improve disaster resilience or latency, but moving writes across distance changes consistency and cost. Duplicate application deployments alone do not create a recoverable product.

## How it works

Define which region owns writes and how data is replicated. Route users under explicit health and locality policy. Active-passive promotes or enables a recovery region; active-active serves work in several regions and needs ownership or conflict semantics. Failover includes data, credentials, messaging, dependencies and traffic—not just DNS.

## Key concepts

RPO/RTO depend on replication and promotion. Synchronous cross-region writes add network latency and partition constraints. Data residency governs placement. Traffic routing must account for cached DNS and existing connections. Failback is a separate migration.

## Production example

An account service runs in one write region with an asynchronous recovery copy. A regional outage requires promotion under the agreed possible data-loss window. Before reopening, operators fence the old writer and reconcile external operations. A drill verifies recovery credentials and downstream integrations in the second region.

## Trade-offs

More regions reduce selected failure exposure and can improve reads near users. They add replicated resources, egress, coordination and operating complexity.

## Failure modes / pitfalls

Split brain, unsupported dependencies, untested failback and claiming zero loss from asynchronous copies undermine the design.

## When to use it

Use multi-region architecture when recovery, latency or placement requirements justify it.

## When not to use it

A well-designed multi-zone deployment may satisfy availability needs without cross-region coordination.

## What a Senior Engineer should know

Explain write ownership, routing and data-loss behavior during failover.

## What a Staff Engineer should understand

Align regional topology with business guarantees and rehearse complete product recovery.

Further reading: [Google Cloud disaster recovery planning](https://docs.cloud.google.com/architecture/dr-scenarios-planning-guide).
