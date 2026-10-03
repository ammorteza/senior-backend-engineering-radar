---
title: "Incident response and blameless postmortems"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Incident response is the coordinated process of detecting production impact, understanding enough of the situation to act safely, restoring acceptable service, and communicating status. A blameless postmortem is the follow-up process that reconstructs how the system and organization allowed the incident to happen and turns that learning into durable improvements.

“Blameless” does not mean nobody is accountable for work. It means the analysis avoids stopping at “an engineer made a mistake” and instead examines the conditions, tools, defaults, feedback, and decisions that made that action reasonable or dangerous.

## Why it matters for backend engineers

During an incident, multiple engineers changing different things can make diagnosis harder and increase impact. Teams need shared roles, an explicit timeline, and a bias toward safe mitigation.

After recovery, the organization needs more than a root-cause label. If a rollout repeatedly causes outages, telling engineers to “be careful” leaves the same system in place. Reliability improves when the postmortem changes guardrails, tests, deployment policy, capacity, or ownership.

## How it works

Start by declaring the incident when user impact or credible risk warrants coordination. State what is known, what is uncertain, who is coordinating, and where communication happens.

For larger incidents, separate roles: an incident commander coordinates priorities and decisions; technical responders investigate and mitigate; a communications role updates stakeholders. Small incidents can combine these roles, but the responsibilities still matter.

Maintain a timestamped timeline of observations, changes, and outcomes. Prefer reversible mitigation that reduces impact—rollback, traffic shift, disabling a feature—before pursuing a complete causal explanation.

Verify recovery using user-relevant signals, not only “pods are green.” Watch for relapse, backlog drain, and side effects caused by mitigation.

The postmortem reconstructs events from evidence, identifies contributing technical and organizational factors, and records actions with owners and completion criteria. Actions should address mechanisms: a representative load fixture, a safer migration pattern, an admission limit, or better rollback automation.

## Key concepts

**Mitigation versus diagnosis.** You may know enough to reduce impact before knowing the full cause. Do not delay a safe rollback just to finish an investigation.

**Severity.** Classify from user/business impact and operational scope, not from how stressful the incident feels.

**Hypothesis discipline.** Separate observations from interpretations. “DB connections doubled at 14:03” is evidence; “the connection pool caused the outage” is a hypothesis until tested.

**Change control.** Record who changed what and why. Multiple simultaneous experiments destroy causal information.

**Handoff.** Long incidents require explicit transfer of current state, mitigations, outstanding risks, and next hypotheses.

**Action quality.** “Add monitoring” or “be more careful” is weak. A good action names the failure mechanism, responsible owner, and verifiable change.

## Production example

A service's p95 latency jumps from 80 ms to 1.5 seconds shortly after a release. Pod CPU and memory look normal, while database CPU reaches 90% and connection count doubles.

The incident commander stops unrelated changes and assigns one engineer to examine the deployment diff while another checks database waits and query statistics. The team observes that a feature flag enabled a new endpoint whose query plan reads far more rows for large tenants.

Rollback to the previous endpoint immediately reduces database work and restores latency. The team verifies request success, database CPU, pool wait, and replica lag before declaring recovery. It also checks for queued work created during the slowdown.

The postmortem does not conclude “developer wrote a bad query.” It identifies that the performance fixture represented small tenants only, the rollout metric did not segment by tenant size, and the feature flag could expand globally without a database-load gate.

Actions add a skewed-data query regression test, tenant-segmented rollout, query-plan review for the endpoint, and a database saturation stop condition. The owner and due date of each action are recorded.

## Trade-offs

Formal roles and timelines reduce coordination errors in large incidents but can be excessive for a small, obvious failure. Scale the process to impact.

Postmortems consume engineering time. They are valuable when they identify reusable lessons and completed actions; writing long narratives with dozens of low-value actions creates fatigue.

## Failure modes / pitfalls

Changing many variables at once makes it impossible to know what helped. Prematurely declaring a root cause narrows investigation before evidence supports it.

A rollback can restore service while leaving corrupted or duplicated business state; recovery verification must include correctness, not only latency.

Postmortems become ineffective when actions remain unowned, the same class of incident repeats, or the document is used to assign personal blame and people stop sharing evidence.

## When to use it

Use an explicit incident process whenever impact, uncertainty, or responder count makes coordination valuable.

Write a postmortem for incidents with meaningful learning, repeated patterns, high impact, or near misses that reveal a serious gap.

## When not to use it

Do not delay an obvious safe mitigation in order to satisfy a process step. Do not require a full postmortem for every minor transient error if there is no new learning.

Do not use “blameless” language to avoid difficult accountability about ignored risks or incomplete follow-up; focus accountability on improving the system and completing actions.

## What a Senior Engineer should know

A Senior Engineer should communicate evidence concisely, form and test hypotheses, execute reversible mitigation, and preserve a useful timeline.

They should verify recovery across user impact and data correctness and contribute postmortem actions that address mechanisms rather than symptoms.

## What a Staff Engineer should understand

A Staff Engineer should improve incident systems across teams: severity policy, escalation, communication, handoffs, postmortem quality, and action follow-through.

They should identify recurring organizational failure modes—unsafe migrations, shared dependency saturation, slow rollback—and invest in controls that reduce an entire class of incidents.

Further reading: [Google SRE: Managing Incidents](https://sre.google/sre-book/managing-incidents/), [Google SRE Workbook: Postmortem Culture](https://sre.google/workbook/postmortem-culture/).
