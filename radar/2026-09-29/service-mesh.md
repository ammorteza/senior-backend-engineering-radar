---
title: "Service mesh"
ring: assess
segment: platforms
tags: [backend]
---

## What it is

A service mesh provides infrastructure-level workload communication policy, commonly through proxies or node-based data-plane components. It can enforce identity, encryption and traffic controls without each application implementing them.

## Why it matters for backend engineers

Many teams may need consistent workload authentication and communication telemetry. The mesh also adds components to every relevant network path and therefore changes incident diagnosis.

## How it works

A control plane distributes identities and routing policy to the data plane. Traffic interception applies mTLS, authorization and configured routing at supported boundaries. Sidecar and newer non-sidecar designs have different deployment and feature behavior. Applications still own business authorization and request semantics.

## Key concepts

Control-plane failure differs from data-plane failure. Certificate rotation, policy propagation and proxy resource use need observation. Retry and timeout policy must coordinate with application clients. Workload identity authenticates a caller but does not authorize every business operation.

## Production example

An internal API accepts traffic only from a reporting workload identity. A mesh policy enforces that boundary while the API still checks which customer's reports the caller may access. Operators test certificate rotation and inspect proxy refusals separately from application errors.

## Trade-offs

Central policy reduces repeated implementation. Proxy overhead, upgrades and topology complexity can outweigh the benefit in small systems.

## Failure modes / pitfalls

Double retries, incorrect interception, broad allow policies and debugging only application logs can obscure failures. Encryption does not repair weak tenant checks.

## When to use it

Evaluate a mesh for repeated identity or traffic-policy requirements across enough workloads to justify platform ownership.

## When not to use it

Prefer libraries, ingress controls or simpler identity mechanisms when those meet the actual scope.

## What a Senior Engineer should know

Understand interception, policy, mTLS and proxy diagnostics.

## What a Staff Engineer should understand

Choose data-plane architecture and own upgrades, certificate lifecycle and escape paths.

Further reading: [Istio architecture](https://istio.io/latest/docs/ops/deployment/architecture/).
