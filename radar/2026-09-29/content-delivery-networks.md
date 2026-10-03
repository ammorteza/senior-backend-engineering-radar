---
title: "Content delivery networks"
ring: trial
segment: platforms
tags: [backend]
---

## What it is

A Content Delivery Network (CDN) serves cacheable content and other edge-handled traffic from geographically distributed points of presence closer to users than the origin. It can reduce latency, bandwidth, and origin load.

A CDN is also a cache and routing layer with its own key, freshness, purge, and security rules. Correctness depends on knowing which requests share one cache entry and when the edge is allowed to reuse a response.

## Why it matters for backend engineers

A correct origin can produce an incorrect product when the CDN caches the wrong representation. If tenant identity, locale, authorization, or query parameters affect a response but are absent from the cache key, one user's data can be served to another.

Availability also changes. A CDN can absorb traffic during origin stress or, after a purge/cold miss, cause thousands of edge requests to hit the origin simultaneously. Engineers need to plan cache fill and failure behavior rather than treat hit ratio as the only metric.

## How it works

A request reaches an edge location. The CDN derives a cache key from configured parts of the request—typically host/path and selected query/header information—and checks for a stored representation.

If an entry is fresh, the edge can serve it without contacting the origin. If it is stale, HTTP validators such as `ETag` or `Last-Modified` may allow revalidation. Provider-specific stale-serving features can return older content while the origin is slow or unavailable.

On a miss, the edge fetches from the origin and may store the response according to HTTP cache headers and CDN-specific policy. Tiered caching can reduce the number of origin fills by allowing lower-tier edges to fetch from an upper-tier cache.

Purges invalidate cached objects under provider-specific propagation behavior. Purging is not a cross-world transaction that guarantees every request instantly sees new content.

## Key concepts

**Cache key.** Every request dimension that changes the representation must either participate in the key or prevent shared caching. Including unnecessary dimensions reduces hit ratio.

**Freshness versus retention.** Freshness determines how long content may be reused without revalidation. Retention/eviction determines whether an object stays stored at the edge. They are not the same concept.

**Vary.** HTTP `Vary` identifies request headers that affect representation selection. CDN support and custom cache rules need to be understood together.

**Immutable assets.** Content-hashed filenames allow long freshness because changing content produces a new URL. This avoids relying on global purge for ordinary deployments.

**Origin protection.** The origin should authenticate or restrict edge traffic where appropriate, otherwise clients may bypass edge limits/WAF/caching by calling the origin directly.

## Production example

A web application serves JavaScript bundles and personalized account pages through a CDN.

Static bundles use filenames such as `app.8d31c4.js` and a long immutable cache lifetime. HTML references the new hash on deployment, so old cached assets remain harmless and no global purge is required.

Account responses are authenticated and vary by user. The team initially caches `/account` by path, causing a severe cross-user leak in a test environment. The repair disables shared caching for that route instead of trying to add every cookie to the key. Automated tests issue the same path under two identities and confirm no response is reused across them.

A release also purges a popular documentation page. All edge locations miss at once and the origin's database traffic spikes. The team adds an origin-safe cache-fill design—tiered caching or request coalescing where supported—and load-tests a cold-cache event rather than only steady-state hit traffic.

Metrics include hit/miss/revalidation status, origin request rate, response age, and per-route cacheability. This lets engineers tell “edge cache is cold” from “origin became slower.”

## Trade-offs

Long freshness maximizes performance and origin protection but delays updates unless URLs are immutable or invalidation is reliable. Short freshness improves update visibility while increasing origin traffic.

Adding headers/cookies to cache keys preserves representation correctness but fragments the cache. Personalized dynamic traffic may be better bypassed or cached at a more specific authenticated layer.

CDN-specific features improve control but increase provider coupling.

## Failure modes / pitfalls

Caching authenticated or personalized responses under an incomplete key can leak data. Ignoring query normalization can create cache fragmentation or poisoning opportunities.

Caching error responses too aggressively can prolong incidents. Purging many hot objects at once can overload the origin. Trusting public requests to the origin bypasses edge WAF/rate limits.

Testing from one location can miss regional cache behavior. Edge success also does not prove the origin is healthy; a stale cached response may hide origin failure.

## When to use it

Use CDNs for static assets, public downloads, cacheable APIs, and edge delivery where latency and origin offload are valuable.

Design the cache contract per route: key, TTL, revalidation, stale behavior, purge, and origin fallback.

## When not to use it

Do not cache sensitive personalized data by default. Do not force rapidly changing transactional state through a shared cache when freshness or authorization semantics make reuse unsafe.

Avoid introducing edge logic for requests that gain no latency, availability, or security benefit from it.

## What a Senior Engineer should know

A Senior Engineer should inspect cache keys, headers, `Age`/provider cache status, revalidation, invalidation, and origin load during misses.

They should verify cache behavior with different identities and representative query/header combinations, not just one anonymous request.

## What a Staff Engineer should understand

A Staff Engineer should define edge/origin trust, provider strategy, cache conventions, and origin capacity for cold-cache or regional-failure scenarios.

They should decide which content should be immutable, which can serve stale, and which must bypass shared caching, balancing correctness, cost, and resilience.

Further reading: [RFC 9111: HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111).
