---
title: "Multi-region architecture"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Multi-region architecture runs important product capabilities in more than one geographic cloud region. It can reduce regional-disaster risk, improve latency for distant users, or satisfy placement requirements.

The phrase is incomplete without a data and traffic model. An active-passive system can have one write region and a recovery region. An active-active system can serve or write in several regions. The recovery and consistency problems are very different.

## Why it matters for backend engineers

Deploying the same containers in two regions does not create a multi-region product. Databases, queues, object storage, secrets, DNS, external providers, and operational access all participate in recovery.

Cross-region writes also face physical latency. Strong coordination between Berlin and a distant US region cannot have the same latency as one-zone communication. Engineers need to decide which business invariants truly require cross-region coordination and which can use regional ownership or asynchronous replication.

## How it works

Start with failure and product objectives. Define the regional failures the system must survive, the RPO (acceptable data loss), the RTO (acceptable recovery time), and any data-residency constraints.

In **active-passive**, one region normally owns writes. Data is replicated to the recovery region. Failover must fence the old writer, verify the recovery copy's position, promote or enable it, update routing, restore dependencies, and reconnect clients. Failback later is a separate migration.

In **active-active**, multiple regions serve traffic concurrently. Reads are relatively easy to distribute; writes require an ownership or conflict strategy. A common design assigns each customer or partition to one write region while allowing local reads elsewhere. True multi-writer data needs conflict semantics or coordination.

Traffic steering can use DNS, global load balancing, or an edge network. Existing DNS caches and long-lived connections mean a route change is not instant. The old path must be safely fenced even if some clients continue reaching it.

## Key concepts

**RPO and RTO.** RPO describes tolerated data loss; RTO describes tolerated time to restore. Both must include application and external dependencies, not only database promotion.

**Write authority.** Which region can commit each piece of data? If the answer is “both,” what happens when communication fails?

**Fencing.** A failed or partitioned old region must not resume writes independently after another region takes ownership.

**Data residency.** Backup, logs, analytics, and support access can also move data across regions. Placement policy must include those copies.

**Failback.** Returning to the original region requires resynchronization, routing, and authority transfer. It can be as risky as failover.

## Production example

An account service runs primarily in region A and asynchronously replicates PostgreSQL state to region B. The product accepts an RPO of up to one minute for a complete regional disaster and an RTO of 30 minutes.

A drill isolates region A. Operators first fence its write path using the cloud/platform authority; they do not simply promote B while A might still accept writes. They inspect replication position and record the exact uncertainty window.

Region B is promoted, application capacity scales, secrets and provider credentials are verified, and global traffic is shifted. Existing client connections to A fail and reconnect. Queued messages are examined for whether their source state survived the promotion.

One payment-related operation may have reached an external provider while its local database record was inside the lost replication window. The recovery runbook reconciles such operations by stable provider/business IDs before retrying them.

After the incident, failback waits until A is rebuilt from current authoritative state. The team measures real RTO from declaration through usable product recovery, not only database promotion time.

## Trade-offs

More regions reduce exposure to selected regional failures and can improve read latency. They add replicated infrastructure, network egress, data synchronization, more complex deployments, and harder incident decisions.

Synchronous cross-region replication can lower data-loss risk but adds latency and can stop writes during a partition. Asynchronous replication preserves local write latency and availability at the cost of a loss window.

## Failure modes / pitfalls

Split brain is the most dangerous failure: two regions accept writes under conflicting authority. Automatic failover without reliable fencing increases this risk.

Dependencies are often forgotten. The secondary region may have no provider quota, stale secrets, missing certificates, or insufficient database connections.

Untested DNS/routing propagation, no failback plan, and claiming zero data loss from asynchronous copies are recurring mistakes.

## When to use it

Use multi-region architecture when regional disaster recovery, user latency, or placement requirements justify the operational and consistency cost.

First prove that a robust multi-zone design cannot satisfy the actual requirement more simply.

## When not to use it

Do not adopt active-active writes because “global” sounds resilient. If one region can own writes within the latency objective, that may be substantially easier to operate correctly.

Do not count a cold backup in another region as the same architecture as an active failover environment; recovery characteristics differ.

## What a Senior Engineer should know

A Senior Engineer should explain write ownership, replication mode, data-loss window, routing, fencing, and dependency readiness during a region failure.

They should participate in drills that include real application reconnect, queues, external side effects, and recovery verification.

## What a Staff Engineer should understand

A Staff Engineer should align regional topology with business RPO/RTO, data residency, cost, and organizational on-call capability.

They should decide which invariants remain regional, which require global coordination, and how failover authority is exercised safely under incomplete information.

Further reading: [Google Cloud disaster recovery planning guide](https://docs.cloud.google.com/architecture/dr-scenarios-planning-guide).
