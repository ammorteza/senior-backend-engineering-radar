---
title: "Kubernetes"
ring: adopt
segment: platforms
tags: [backend]
---

## What it is

Kubernetes is a control-plane-driven container orchestration system. Users declare desired objects such as Deployments, Services, Jobs, and ConfigMaps; controllers continuously compare desired and observed state and try to reconcile the cluster toward that declaration.

Kubernetes automates placement, replacement, rollout, and service discovery. It does not make applications stateless, make every replica safe, or recover business work that existed only in memory.

## Why it matters for backend engineers

Backend engineers need enough Kubernetes literacy to distinguish application failure from scheduling, readiness, networking, or resource-policy failure.

A pod marked Running may not be Ready. A Deployment may have enough replicas while all of them sit in one failure domain. A liveness probe that depends on the database can restart an entire fleet during a database incident and make recovery worse.

The practical goal is not memorizing every object. It is understanding the lifecycle of a workload and the evidence available when that lifecycle goes wrong.

## How it works

The API server exposes and persists cluster objects. Controllers watch those objects and create or update dependent resources. The scheduler assigns pending pods to nodes based on requests, constraints, taints and tolerations, affinities, topology, and other policies. Kubelets on nodes start and monitor containers.

A Deployment manages ReplicaSets and rolling updates for stateless-style workloads. A Service provides a stable virtual identity over selected ready endpoints. EndpointSlices represent the backing network endpoints.

Resource **requests** influence scheduling and guaranteed capacity assumptions. Resource **limits** constrain runtime usage through mechanisms such as cgroups. CPU can be throttled; memory over a hard limit can result in OOM termination.

Probes serve different purposes. Readiness controls whether an endpoint should receive traffic. Liveness asks whether restarting the container is an appropriate recovery action. Startup probes delay liveness/readiness behavior while slow initialization completes.

On termination, Kubernetes sends SIGTERM and waits up to the pod's termination grace period before forceful termination. Application code must use that window to become unready, stop accepting new work, and drain or make in-flight work recoverable.

## Key concepts

**Desired versus observed state.** A controller's job is reconciliation, not one-time provisioning. Manual changes may be overwritten by reconciliation.

**Readiness.** Traffic admission signal. A dependency outage should not automatically mean every pod must restart.

**Liveness.** Restart signal for failures that a restart can plausibly repair.

**Requests and limits.** Requests influence placement and resource accounting; limits govern runtime caps. They solve different problems.

**Pod Disruption Budget.** Limits voluntary disruptions such as drains and upgrades; it does not prevent involuntary node failure.

**Topology spread and anti-affinity.** Help place replicas across failure domains. Replica count alone does not guarantee spread.

## Production example

An API has a liveness probe that checks PostgreSQL. During a brief database outage, every pod fails liveness and restarts. Restarted pods all open new connection pools at once, increasing pressure on the recovering database.

The team changes the probe design. Liveness checks only the process/runtime state that a restart can repair. Readiness reflects whether the pod can currently serve requests under the product's degradation policy.

The service handles SIGTERM by immediately failing readiness, waiting for endpoint removal to propagate, stopping new background work, and draining in-flight requests before exiting.

Resource requests are based on measured steady CPU and memory; limits are tested under burst load. The team runs `kubectl get pods`, `kubectl describe pod`, `kubectl get events`, `kubectl top`, rollout status, and EndpointSlice inspection during a controlled rollout to verify the lifecycle.

A node-drain test confirms enough replicas remain available and that the PodDisruptionBudget does not get mistaken for protection against an abrupt node crash.

## Trade-offs

Kubernetes gives powerful reconciliation, scheduling, and extensibility but adds APIs, controllers, networking, and upgrade responsibility.

High abstraction can improve developer self-service while making failure harder to understand if teams cannot inspect the underlying objects. A managed Kubernetes service reduces control-plane operations but does not remove workload and cluster design decisions.

## Failure modes / pitfalls

Missing resource requests make scheduling and capacity unpredictable. Overly tight CPU limits cause throttling; memory limits sized only from language heap can trigger OOMs.

Bad probes create restart or traffic-removal loops. Mutable image tags make rollouts non-reproducible. Overprivileged service accounts expand blast radius.

Insufficient termination grace and application shutdown handling lose requests during deployment. Putting all replicas in one zone undermines availability claims.

## When to use it

Use Kubernetes when the organization benefits from a shared orchestration platform, many containerized services, policy control, and extensible scheduling or lifecycle behavior.

Backend engineers should learn the objects their services actually depend on and the commands needed to diagnose them in production.

## When not to use it

A few simple stateless services may be cheaper and easier on a managed application runtime. Do not introduce Kubernetes merely because containers exist.

Do not use Kubernetes objects as a substitute for application-level durability, idempotency, or database transactions.

## What a Senior Engineer should know

A Senior Engineer should understand Deployments, Pods, Services, EndpointSlices, probes, requests and limits, events, graceful termination, Jobs, ConfigMaps and Secrets, and common `kubectl` inspection flows.

They should distinguish Pending scheduling failures, CrashLoopBackOff application failures, readiness failures, image-pull problems, OOM termination, and service-routing issues from evidence.

## What a Staff Engineer should understand

A Staff Engineer should define cluster tenancy, upgrade strategy, workload identity, default resources, policy, failure-domain placement, and platform support boundaries.

They should decide which Kubernetes complexity is exposed to product teams and which is safely standardized, while ensuring abstractions remain debuggable.

Further reading: [Kubernetes concepts](https://kubernetes.io/docs/concepts/), [Application debugging](https://kubernetes.io/docs/tasks/debug/debug-application/).
