---
title: "Event-driven architecture"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Event-driven architecture lets components react to published facts without requiring the producer to wait for every reaction. A fact such as `RecordingFinalized` describes an occurrence; a command such as `TranscodeRecording` asks an owner to perform work. Both can travel asynchronously, but their contracts and accountability differ.

The architectural choice is where to place asynchronous boundaries. It does not require splitting every internal operation into a service, and using a broker alone does not establish a well-designed event model.

## Why it matters for backend engineers

Independent subscribers can evolve, recover and scale without being on the producer's synchronous response path. Buffering can absorb temporary bursts and let one consumer lag without immediately blocking others.

The cost is delayed knowledge. Successful publication does not prove that captions, billing or notifications are complete. Engineers must expose intermediate product states, monitor outstanding obligations and make recovery understandable across components that no longer share one call stack.

## How it works

An owner commits a state change and reliably records publication intent, often through an outbox. A broker or log distributes the event to separately owned subscriptions or consumer groups. Each consumer interprets the contract, applies its effect and records progress under its chosen delivery protocol.

Separate subscriptions support fan-out: each application receives the facts it needs. Multiple workers sharing one subscription generally distribute that subscription's work. Confusing these topologies can make two independent applications steal work from each other instead of both receiving it.

The event can carry relevant state, a compact notification or a reference to a versioned object. These designs have different consequences. A reference reduces payload size but creates a read dependency on the producer; querying current state later may not reproduce the state at the time of the event. A richer event can support independent processing but replicates data and broadens its retention and access footprint.

Consumers handle duplicates and ordering within explicit scopes. A causal identifier can link related events, but a trace ID is not a transaction and a timestamp does not impose global order. If completion requires several reactions, a workflow owner must track that requirement rather than infer completion from publication alone.

## Key concepts

**Fact versus request.** A producer owns the truth of a published fact. A command has a recipient responsible for accepting, rejecting or completing requested work. Past-tense naming helps communication but cannot repair an ambiguous contract.

**Temporal coupling.** Removing a synchronous call can let a producer continue while a consumer is down. The systems remain coupled through schema, meaning, retention and expected completion time.

**Eventual consistency.** A derived view may temporarily disagree with the source. Define what users see during that interval and what happens if the interval exceeds its objective.

**Replay.** Retained facts can rebuild projections or recover consumers. Replaying an event must not automatically repeat irreversible effects such as sending historical notifications.

**Completion ownership.** A set of event subscriptions is not a substitute for a process state machine when a customer is waiting for one combined outcome.

## Production example

A media platform finalizes an uploaded recording. Caption generation, search indexing and usage accounting each need to react, but the upload endpoint should not wait for them all.

The recording owner publishes an event containing a stable recording revision and immutable object reference. Captioning has its own subscription and bounded worker concurrency; indexing and accounting have independent progress. A caption-provider outage does not stop search indexing, and the UI displays “captions pending” rather than claiming full processing success.

A duplicate finalization event must not create a second billable usage entry. Accounting records event or business-operation identity atomically with its ledger change. Indexing applies version-aware updates. Captioning gives each recording revision a durable job identity so retries recover the existing job.

A later deletion introduces a second important fact. A delayed finalization event must not resurrect a deleted recording. Consumers consult their lifecycle/version protocol, and object access policy prevents an old reference from bypassing removal. This is a domain rule, not something the broker can infer.

The team traces recording revision, event identity and consumer result across the pipeline. Recovery tests stop one consumer, build backlog, then resume at a rate the provider and databases can sustain. A successful test demonstrates correct completion and bounded recovery, not just that a message reached a topic.

## Trade-offs

EDA supports independent consumers, buffering and replay. It increases the number of states and operational boundaries needed to explain one user-visible result. Failure isolation is only partial when consumers still share databases, credentials or saturated broker capacity.

Richer events reduce callback dependence while increasing duplication of sensitive data and migration obligations. Thin notifications reduce payload coupling but can make every replay depend on the source API's availability and historical-state support.

## Failure modes / pitfalls

Publishing with an unprotected database/broker dual write can lose facts. A consumer that emits another event before committing its own state can propagate a fact it later rolls back. Durable publication principles apply at every producer, including consumers that become producers.

Unbounded fan-out can create surprising costs. Circular reactions can generate feedback loops. A dead-letter queue without ownership leaves business work abandoned even if the main subscription looks healthy.

## When to use it

Use asynchronous events when several independent capabilities react to facts, when temporary consumer downtime should not block the producer, or when retained history supports legitimate replay.

Define completion objectives, lifecycle handling and consumer ownership before moving a synchronous dependency off the request path.

## When not to use it

Prefer a direct call when one owner must answer immediately and there is no useful asynchronous product state. Keep tightly coupled updates in a local transaction when that is a viable ownership boundary.

Do not turn internal function calls into public event contracts without a concrete need for independent processing. Every such contract creates long-term interpretation and recovery work.

## What a Senior Engineer should know

A Senior Engineer should design event meaning, identity, payload and acknowledgement behavior together. They should understand how fan-out differs from worker distribution and protect consumers against duplicate, old and replayed events.

They should diagnose which stage is behind and explain the actual customer state without relying on a single producer success metric.

## What a Staff Engineer should understand

A Staff Engineer should decide which asynchronous boundaries provide useful autonomy and which merely obscure coordination. Assign ownership of event meaning, combined workflows and abandoned work across teams.

Govern deprecation, access and replay without creating a central team that must approve every domain change. The goal is independently operable contracts with explicit limits, not maximum message traffic.

Further reading: [Event-driven architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven), [CloudEvents primer](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/primer.md).
