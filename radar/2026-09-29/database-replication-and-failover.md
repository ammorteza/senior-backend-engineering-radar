---
title: "Database replication and failover"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Replication maintains additional copies of database state. Failover changes which instance is authorized to accept writes when the current primary cannot continue. These are separate problems: having a recent copy does not establish safe leadership, and promoting a reachable replica does not prove that it contains every acknowledged write.

A useful design states the replication mechanism, acknowledgement policy, failure domains and promotion procedure. “We have a replica” is not enough to infer availability or data-loss guarantees.

## Why it matters for backend engineers

Applications encounter the consequences directly. Replica reads can return old state, failover can break pooled connections, and a lost response around commit can leave an operation's outcome unknown. Retrying every failed request may create duplicate effects even when database recovery itself was correct.

The database and application also share recovery responsibilities. The platform can promote a node, but the service must reconnect, bound retry traffic and reconcile operations whose external effects no longer match the recovered database state.

## How it works

With PostgreSQL physical replication, standbys receive and replay WAL representing changes to the database cluster. This supports a close storage-level copy within compatible engine arrangements. Logical replication publishes data changes for selected relations, providing different migration and integration options; schema changes and other objects require explicit handling under the supported feature set.

Asynchronous commit can acknowledge a write before a replica has received it. Synchronous configurations wait for specified standby participation, with modes distinguishing receipt, durable flush or application as appropriate. The chosen policy changes latency and behavior when required replicas are unavailable.

A failover mechanism must determine when to act, prevent the old primary from continuing as an independent writer, choose a suitable candidate, promote it and update routing. Fencing may use platform authority, storage access or other reliable mechanisms; merely losing contact does not prove the old node stopped accepting writes.

Existing sessions do not magically move to the new primary. Clients must discard failed connections and reconnect through the supported endpoint. The former primary needs a controlled rejoin procedure, such as supported rewind or reinitialization, rather than being restarted into the old role.

## Key concepts

**Receive, flush and replay positions.** A standby can possess WAL that is not yet durable, or durable WAL that has not been applied for reads. These positions answer different questions about durability and visibility. A lag-in-seconds display alone is insufficient for promotion decisions.

**Synchronous acknowledgement is conditional.** Its guarantee depends on configured participants, acknowledgement level and the failures considered. Waiting for a required remote node can block writes during a network partition.

**Replication slots retain resources.** A stalled consumer can cause WAL accumulation. Retention limits can protect storage while making the consumer unable to resume without reinitialization. Monitor both retention and consumer progress.

**Read-after-write.** A successful primary write does not mean an arbitrary asynchronous replica can immediately serve the new value. Route sensitive reads appropriately or implement a supported position-aware strategy.

**Split brain.** Two writable primaries can accept divergent histories. Selecting a winner later is not equivalent to having prevented conflicting business operations.

## Production example

A primary becomes unreachable from the failover controller, but some application instances may still reach it. An asynchronous standby is available and appears roughly thirty seconds behind based on monitoring.

The incident team first follows the established authority and fencing procedure. Promoting immediately without isolating the old writer could turn an availability incident into divergent writes. They assess the candidate's received, durable and replayed state, along with the configured recovery objectives. A time-lag estimate does not by itself reveal the exact set of acknowledged transactions that would be lost.

After a controlled promotion, routing changes and application pools reconnect. Retry concurrency is bounded to avoid a connection storm. Operations interrupted near commit are checked using durable business identifiers where available; they are not automatically repeated with new identities.

The team then reconciles external effects. A notification or provider-side action may have happened for a transaction missing from the promoted database. Conversely, a replayed database record might refer to work whose external result is unknown. Recovery procedures must address these cases rather than assuming promotion restores business consistency automatically.

Finally, the old primary rejoins only through the supported recovery path. The drill records user-visible recovery duration and identified data-loss uncertainty, so future RPO/RTO claims reflect the whole workflow.

## Trade-offs

Asynchronous replication keeps primary writes less dependent on replica availability but accepts a loss window and stale reads. Synchronous replication can reduce selected loss windows while adding network latency and potentially blocking progress when required participants fail.

Read replicas add capacity for eligible queries, but heavy replica workloads can interact with replay and retention. More copies also increase operational cost and do not protect against every failure: an accidental DELETE can replicate perfectly to all of them.

## Failure modes / pitfalls

Stale endpoints or long-lived connections can keep clients on an obsolete node. Promotion without fencing can create split brain. A slot can fill storage while the main application appears healthy. A delayed standby can be mistaken for a safe recovery candidate simply because it answers health checks.

Logical replication is not a transparent copy of every database object. Coordinate schema compatibility, sequences and supported object behavior for the actual migration. Also distinguish an HA standby from a read replica; managed products may expose different capabilities for each.

## When to use it

Use replication for justified availability, read scaling or migration needs, with explicit guarantees for each purpose. Document how a candidate is selected, who may promote it and how the old primary is prevented from writing.

Exercise failover with the application, not just database processes. Include connection replacement, ambiguous operations, retry load and rejoining the former primary.

## When not to use it

Do not claim zero data loss from an asynchronous topology. Do not treat replica count as a substitute for backups or independent recovery copies.

Avoid adding read replicas before confirming that the expensive workload tolerates lag and can actually be routed away from the primary. Replication cannot fix a write bottleneck by copying the same writes to more nodes.

## What a Senior Engineer should know

A Senior Engineer should inspect replication progress, distinguish durability from replay visibility and explain what happens to active sessions during promotion. They should implement safe reconnect and retry behavior without duplicating uncertain operations.

They should also understand retained WAL, standby query conflicts and the actual replication mode in use, rather than relying on a generic “replica healthy” indicator.

## What a Staff Engineer should understand

A Staff Engineer should define failover authority, fencing, failure domains and recovery objectives across database and application layers. Cross-region designs need explicit decisions about latency, partitions and acceptable loss.

Rehearse reconciliation and old-primary recovery, and ensure the organization can make a deliberate availability-versus-data-preservation decision under pressure. Automation should encode that policy rather than silently invent it during an outage.

Further reading: [PostgreSQL high availability](https://www.postgresql.org/docs/current/high-availability.html), [Standby replication](https://www.postgresql.org/docs/current/warm-standby.html), [Logical replication restrictions](https://www.postgresql.org/docs/current/logical-replication-restrictions.html).
