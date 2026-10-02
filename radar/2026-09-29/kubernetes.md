---
title: "Kubernetes"
ring: adopt
segment: platforms
tags: [backend]
---

## What it is

Kubernetes reconciles declared workloads with cluster state. It schedules containers and manages rollout, service discovery and recovery, while leaving application correctness and many capacity decisions to operators.

## Why it matters for backend engineers

A running container is not necessarily ready to serve, and replacement pods do not recover in-memory business work. Engineers need to understand the control loops behind deployment symptoms.

## How it works

The API server stores desired objects; controllers compare them with observed state. The scheduler selects nodes for pending pods, and kubelets manage containers there. Deployments maintain ReplicaSets; Services route to eligible endpoints. Resource requests influence scheduling, while limits constrain runtime use through mechanisms such as cgroups.

## Key concepts

Readiness controls traffic eligibility; liveness can restart an unhealthy container; startup probes protect initialization. CPU limits can throttle; exceeding a memory limit can cause OOM termination. Termination grace, disruption budgets and topology placement affect availability in different situations.

## Production example

A service puts database reachability in its liveness probe. A brief database outage restarts every pod, multiplying reconnections. The team moves dependency sensitivity to an appropriate readiness policy, retains a local liveness check and tests startup and graceful termination. Events and restart reasons confirm the new behavior.

## Trade-offs

Reconciliation and scheduling reduce manual lifecycle work. Cluster networking, policy and controllers add operational complexity; replicas on one failure domain do not provide regional resilience.

## Failure modes / pitfalls

Missing requests, bad probes, mutable image tags, insufficient termination time and overprivileged service accounts are recurring hazards.

## When to use it

Use Kubernetes when its workload orchestration capabilities justify owning or consuming a cluster platform.

## When not to use it

A few simple services may be easier on a managed application runtime. Do not introduce a cluster merely to run containers.

## What a Senior Engineer should know

Diagnose pods through events, rollout state, logs, resources and endpoints; distinguish scheduling from application failure.

## What a Staff Engineer should understand

Define cluster boundaries, upgrades, tenancy, failure-domain placement and platform support responsibilities.

Further reading: [Kubernetes concepts](https://kubernetes.io/docs/concepts/).
