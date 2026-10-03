---
title: "Cloudflare"
ring: assess
segment: platforms
tags: [backend]
---

## What it is

Cloudflare is an edge platform that can provide authoritative DNS, reverse proxying, CDN caching, TLS termination, DDoS/WAF controls, traffic steering, and edge compute. These are separate products and policy layers that can be enabled in different combinations.

For backend engineers, “behind Cloudflare” is not one technical behavior. A DNS-only record differs from a proxied record; a cached static response differs from a Worker-generated response; and a WAF decision differs from an origin authorization decision.

## Why it matters for backend engineers

The edge sits before the origin, so it can improve latency and absorb attacks—but it can also block legitimate users or serve stale/incorrect content before requests ever reach application telemetry.

Cloudflare configuration is production configuration. Cache rules, header transforms, WAF expressions, origin certificates, and Workers all have blast radius and should be reviewed and rolled out with the same discipline as application changes.

## How it works

Cloudflare DNS can publish records whether or not traffic is proxied. For proxied HTTP(S) records, clients connect to Cloudflare's edge. The edge can terminate TLS, apply security/routing/cache rules, optionally execute Workers, and then make a separate connection to the origin.

Caching follows Cloudflare's cache eligibility and cache-rule behavior combined with origin headers. Current Cloudflare documentation distinguishes freshness from retention and exposes `CF-Cache-Status` for debugging cache outcomes.

A Worker adds programmable logic at the edge under Cloudflare's runtime, resource, storage, and networking constraints. It is not equivalent to moving an ordinary server process unchanged to every edge location.

The origin should know which traffic it trusts from Cloudflare. Forwarded client information must use Cloudflare's documented headers and a network/trust configuration that prevents arbitrary direct clients from spoofing the same context.

## Key concepts

**DNS-only versus proxied.** DNS-only publishes the origin address directly and sends traffic to it. Proxied traffic passes through Cloudflare's network and can use caching/security features.

**Origin protection.** If clients can reach the origin directly, they may bypass WAF, rate limits, or edge authentication. Restrict origin reachability or authenticate the edge where the architecture requires it.

**Cache status.** Provider headers such as `CF-Cache-Status` help distinguish hit, miss, revalidation, stale, and bypass behavior. Combine them with origin metrics.

**Rules ordering.** Several Cloudflare products can transform or evaluate one request. Understand where redirects, cache rules, WAF, Workers, and origin rules run in the relevant product path.

**Provider limits.** Worker CPU/time, storage consistency, request/body limits, and feature availability are product-specific and evolve. Check current product documentation before depending on them.

## Production example

A company hosts a public status site and an authenticated support API behind Cloudflare.

Static status assets are cached with long-lived content-hashed URLs. Incident JSON is cacheable for a short period and can serve a bounded stale value if the origin is temporarily unavailable. The authenticated support API is not shared-cached.

The team then enables a WAF rule intended to block automated scanning. A synthetic check with representative partner traffic shows that one partner's legitimate user agent and request pattern would be blocked. Instead of pushing globally, they narrow the rule and deploy it in observation/logging mode where available before enforcement.

During an origin incident, engineers compare `CF-Cache-Status`, edge error analytics, Worker/WAF logs, and origin access logs. This separates requests blocked at the edge from requests that reached the application and failed there.

They also test direct origin access. If the architecture assumes all public requests pass through Cloudflare, the origin accepts only the intended edge path or requires an origin credential/certificate; a client cannot simply copy a forwarded-IP header and gain trusted status.

## Trade-offs

An integrated edge platform reduces the number of separate services teams operate and provides global capacity quickly. It creates provider-specific configuration, operational knowledge, and coupling.

WAF and bot controls reduce attack traffic but inevitably risk false positives. Edge compute can reduce latency but introduces a distributed runtime with its own debugging and data-consistency model.

## Failure modes / pitfalls

Caching private responses, exposing the origin, or trusting spoofable forwarding headers are high-impact mistakes. A broad WAF/rate rule can cause a self-inflicted outage before origin metrics change.

Provider dashboards can also hide application-side effects: a Worker may retry or transform a request, and cached responses can mask origin degradation.

Treating every Cloudflare product as having the same regional/storage semantics leads to incorrect designs. Read the current documentation for the exact feature in use.

## When to use it

Evaluate Cloudflare when authoritative DNS, CDN, DDoS/WAF protection, traffic steering, or edge compute solves a concrete product or operational requirement.

Start with the smallest product surface that delivers the value and make the origin/edge responsibility explicit.

## When not to use it

Do not move stateful application logic to edge compute solely for novelty. Check runtime, storage, transaction, residency, and debugging needs first.

Do not assume adding Cloudflare removes the need for origin capacity, authentication, observability, or disaster recovery.

## What a Senior Engineer should know

A Senior Engineer should trace a request through DNS, proxying, TLS, cache, WAF/Worker policy, and the origin. They should verify trusted headers and cache behavior and use edge-specific diagnostics during incidents.

They should test security-rule changes against legitimate traffic before broad enforcement.

## What a Staff Engineer should understand

A Staff Engineer should decide which edge capabilities become organizational dependencies, how origin bypass is prevented, and how provider outages/configuration mistakes are contained.

They should evaluate portability, residency, cost, and fallback for critical endpoints and ensure Cloudflare-specific policy has ownership and change control.

Further reading: [Cloudflare Cache concepts](https://developers.cloudflare.com/cache/concepts/), [Cloudflare developer documentation](https://developers.cloudflare.com/).
