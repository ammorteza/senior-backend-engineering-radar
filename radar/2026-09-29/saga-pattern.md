---
title: "Saga pattern"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

A saga coordinates a business workflow through several local transactions, with explicit recovery actions when only some steps complete. Each participant owns its state and commits locally; the workflow does not obtain one ordinary ACID transaction spanning every participant.

Compensation is a new business operation that addresses an earlier effect. Cancelling a reservation can release capacity, but it does not erase the fact that capacity was held. Refunding a payment can return money while leaving fees, notifications and historical records. The intended recovery state must be defined in business terms.

## Why it matters for backend engineers

Backend workflows frequently involve independent owners or external systems that cannot join a shared transaction. The product still needs a comprehensible result when one step succeeds and the next fails.

A saga makes intermediate states and recovery obligations explicit. It also exposes the cost of distributing a workflow: customers and other processes may observe partial progress, compensation can fail, and some actions become irreversible. Those facts need API states, monitoring and support procedures rather than an opaque exception handler.

## How it works

In orchestration, a durable coordinator records the workflow state, requests a participant action and advances when the outcome is known. Requests and replies require stable identities and reliable publication. The coordinator must survive a crash between sending a request and recording its response without starting an unrelated second operation.

In choreography, participants react to events and emit further facts. This can fit a small set of loosely related reactions, but the overall workflow still needs ownership. A chain of events does not automatically provide a place to decide that compensation is complete or a customer needs intervention.

For every step, define success, definitive rejection and unknown outcome. A timeout belongs to the last category until evidence resolves it. Starting compensation for a step that is still completing can create a new race, such as cancelling a reservation before a delayed create finishes.

Compensations need their own idempotency, retries and failure states. After a point where reversal is no longer allowed—the workflow's business-specific pivot—recovery may need to complete remaining work forward. “Retry until success” still requires bounded operational escalation when the dependency cannot recover within the product's deadline.

## Key concepts

**Local atomicity.** A participant should atomically validate and change its own state. The saga coordinates these local results; it does not repair unsafe local updates.

**Intermediate visibility.** Pending inventory, provisional access or incomplete provisioning must have defined behavior for concurrent readers and commands. Sagas do not provide ordinary transaction isolation across participants.

**Compensation data.** Store identifiers and relevant facts needed to reverse or offset a step. Re-reading mutable current state may no longer reveal what the original action did.

**Timeout versus failure.** Missing confirmation is not proof of non-execution. Correlate later replies and provider queries with the original step identity.

**Process ownership.** Somebody must own overdue, compensating and intervention-required workflows, even when every participant reports itself healthy.

## Production example

A travel service coordinates a hotel reservation and a flight reservation. The hotel returns confirmation; the flight provider accepts the request but its response is lost. The service cannot safely label the booking “flight failed” and immediately assume no flight exists.

The persisted workflow records the hotel confirmation and unresolved flight operation ID. It queries or safely retries according to the flight provider's contract. If the flight is definitively rejected, the workflow begins cancellation of the hotel. If the flight exists, the workflow proceeds according to the customer's accepted booking terms and remaining steps.

Hotel cancellation then times out. The customer-facing state remains “cancellation in progress,” and operators can see the outstanding provider operation. The coordinator retries the same cancellation identity where supported or reconciles its result; it does not claim a fully cancelled booking simply because it sent a request.

Tests deliver the original flight confirmation late, duplicate cancellation replies, and restart the coordinator after a provider accepted a request. A late message must be matched to the persisted step and handled according to the current state, not blindly move a cancelled workflow back to confirmed.

This is an illustrative coordination problem, not a claim about a particular travel provider's cancellation rules. If a ticket is non-refundable or a deadline passes, the business must define the acceptable forward recovery or human resolution. Technology cannot manufacture a compensating action that the provider does not allow.

## Trade-offs

Sagas allow independent participants and long-running workflows without holding a distributed transaction open. They require more persistent states, careful concurrency handling and explicit business recovery than one local transaction.

Orchestration centralizes process visibility but can concentrate coupling and ownership. Choreography can keep reactions local while making a long chain harder to reason about. Choose from the workflow's need for coordinated decisions, not from a blanket preference for centralized or decentralized control.

## Failure modes / pitfalls

Treating every timeout as definitive failure can trigger compensation while the original action still runs. Retrying with new identities can duplicate both forward and compensating effects. Forgetting compensation failures leaves workflows permanently half-recovered.

A saga also does not prevent two workflows from competing for the same resource. Reservations, version checks or another participant-level concurrency policy must preserve the local invariant. Keeping all state only in logs makes reliable restart and support intervention much harder.

## When to use it

Use a saga for multi-owner or external workflows where local commits and explicitly defined recovery match the business. Model unhappy paths before selecting a workflow engine.

Include deadlines, irreversible steps, customer-visible states and escalation in the same design as the successful sequence.

## When not to use it

Keep tightly coupled updates in one transactional boundary when one owner can reasonably provide it. Introducing a saga solely to split a simple database operation creates avoidable partial states.

Do not use a saga as a promise that arbitrary actions can be undone. If the business cannot tolerate partial visibility or define recovery, reconsider the service boundary or product contract.

## What a Senior Engineer should know

A Senior Engineer should implement durable step state, stable operation identities and correct handling of late or duplicate replies. They should distinguish rejection from uncertainty and make compensations independently recoverable.

They should test coordinator restarts, participant timeouts and concurrent workflows, including states that require human intervention.

## What a Staff Engineer should understand

A Staff Engineer should align workflow boundaries with business ownership and define who resolves incomplete outcomes across teams. Compensation terms and deadlines need agreement before the architecture depends on them.

Evaluate operational complexity alongside service autonomy. A workflow engine can persist execution, but it cannot decide the organization's policy for an irreversible or disputed result.

Further reading: [Saga design pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga), [Compensating transaction pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction).
