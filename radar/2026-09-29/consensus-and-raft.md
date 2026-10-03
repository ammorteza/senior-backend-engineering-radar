---
title: "Consensus and Raft"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Consensus lets several nodes agree on one ordered history of decisions despite failures and delayed communication. Raft is a consensus algorithm for maintaining a replicated log through leader election, log replication, and carefully constrained membership changes.

Consensus is narrower than “distributed systems.” It is useful when several nodes need one authoritative order—for example, configuration changes or ownership decisions—and incorrect divergence would be worse than temporary unavailability.

## Why it matters for backend engineers

Systems such as etcd and other coordination stores depend on consensus. Understanding the model explains why a healthy minority cannot safely keep accepting writes during a partition and why “just choose another leader” is more subtle than checking which machine answers a ping.

Engineers also need to know what consensus does not solve. Logging “perform external action” through a consensus system does not atomically execute that external side effect.

## How it works

Raft divides time into numbered **terms**. Nodes normally begin as followers. If a follower stops hearing from a leader for a randomized election timeout, it becomes a candidate, increments the term, and requests votes.

A candidate becomes leader after receiving votes from a majority. Majority intersection is central: two different majorities cannot be completely disjoint, which helps preserve committed history.

The leader accepts new log entries, sends them to followers, and tracks replication progress. Entries become committed according to Raft's commit rules; the leader then applies committed entries to a deterministic state machine and tells followers to advance their commit point.

Election restrictions prevent a candidate with an insufficiently up-to-date log from becoming leader and losing committed data. Terms separate leadership epochs, allowing nodes to reject messages from older leaders.

Snapshots compact already-applied log history so nodes do not retain every command forever. Membership changes require a safe algorithm because replacing too many nodes at once can create unsafe quorum assumptions.

## Key concepts

**Safety versus liveness.** Raft prioritizes never committing contradictory histories. During loss of quorum it stops making write progress rather than let minorities diverge.

**Quorum.** In a five-node cluster, three nodes form a majority. Losing two nodes can preserve progress if failures are independent; losing three stops consensus writes.

**Leader lease versus consensus.** Some implementations use timing assumptions to optimize reads. The core safety model is not simply “the leader heartbeat has not expired.”

**Linearizable reads.** Reading from a follower or stale local state is not automatically linearizable. The implementation needs a read protocol that establishes current leadership/commit knowledge.

**Membership.** Adding/removing voters changes quorum mathematics. Follow the implementation's supported reconfiguration protocol instead of manually rewriting peer lists.

## Production example

A five-node configuration cluster spans three failure domains. A network partition creates groups of three and two.

The three-node side can elect or retain a valid leader and commit configuration updates. The two-node side cannot form a majority. Its nodes may be healthy and able to serve TCP requests, but they must not accept authoritative writes.

Suppose one application instance can reach only the minority. It receives an unavailable/not-leader response and fails over to endpoints on the majority side. The platform does not force the minority to elect a leader just to improve availability because that would allow two conflicting configuration histories.

After connectivity returns, the minority catches up from the leader before its state is considered current. Operators inspect term, leader, quorum health, and replication progress instead of using host uptime as a proxy.

A second test sends a command to the leader and drops the client connection before the response. The command may already be committed. The client uses a stable operation identity or reads resulting state rather than assuming timeout means failure. Consensus protects the log; it does not remove uncertain client outcomes.

## Trade-offs

Consensus gives one authoritative order and simple state-machine semantics, but every committed write requires quorum communication and durable work. Cross-region placement therefore directly affects latency.

More voters can tolerate more failures only by increasing quorum size and operational cost. Losing quorum sacrifices availability to preserve safety. That is often correct for coordination metadata but unsuitable for arbitrary high-volume data that does not need total ordering.

## Failure modes / pitfalls

Putting all voters in one rack or zone defeats the intended fault tolerance. Slow disks or long process pauses can trigger elections and reduce throughput even when hosts are alive.

Unsafe membership changes can destroy quorum guarantees. Reading a follower as if it were current can violate expected consistency.

An application can also overload the coordination system by storing large business data or high-frequency events in a log designed for metadata and ownership decisions.

## When to use it

Use a proven consensus-backed system when several nodes need consistent leadership, configuration, or metadata ordering and temporary unavailability is preferable to conflicting authority.

Use the product's supported APIs rather than implementing Raft in ordinary application code.

## When not to use it

Do not implement a custom consensus algorithm for normal application state. Do not route independent high-volume records through one consensus log merely because strong consistency sounds desirable.

A single transactional database can be simpler when it already provides the needed authority boundary.

## What a Senior Engineer should know

A Senior Engineer should explain terms, majority election, log replication, commit, follower catch-up, and why a minority stops writing.

They should distinguish consensus safety from client idempotency and know that reads require their own freshness protocol.

## What a Staff Engineer should understand

A Staff Engineer should design voter placement across failure domains, membership operations, backup/recovery, and cross-region latency deliberately.

They should decide which organizational coordination problems deserve consensus and keep application data out of the coordination plane unless the ordering requirement truly justifies it.

Further reading: [Raft paper](https://raft.github.io/raft.pdf), [Raft resources](https://raft.github.io/).
