---
title: "Grafana"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Grafana is a visualization, exploration, and alerting platform that queries telemetry sources such as Prometheus, logs, traces, and SQL databases. It renders panels and dashboards from those queries and can evaluate alert rules through Grafana Alerting.

Grafana does not make an incorrect metric correct. The reliability of a dashboard depends on the underlying data, query, labels, units, time range, and no-data behavior.

## Why it matters for backend engineers

During an incident, a useful dashboard should help an engineer choose the next hypothesis. A screen containing 80 unrelated graphs creates navigation work instead of reducing it.

Grafana can also mislead quietly. A panel may use the wrong environment variable, average a percentile incorrectly, hide missing data, or retain a copied query after the metric changed.

## How it works

A panel executes a query against a configured data source and renders the returned time series, table, logs, or traces. Dashboard variables let users select dimensions such as environment, region, service, or cluster.

Transformations can join or manipulate returned data, but complex transformations make the final number harder to audit. Prefer correctness in the source query when possible.

Annotations connect operational changes—deployments, feature-flag changes, incidents—to telemetry. Dashboard links and data links provide drill-down from a symptom panel to traces or logs using the same labels/time range.

Grafana Alerting can evaluate queries and expressions independently of dashboard viewing. It has explicit behavior for query errors and no-data/missing-series cases. Those states need policy; “nothing returned” is not automatically healthy.

Provisioning dashboards and alerts from version-controlled files/code makes review and reproducibility easier than manual edits that exist only in one Grafana instance.

## Key concepts

**Information hierarchy.** Begin with user impact and service-level signals, then dependencies and resources. Instance-level graphs are drill-down, not usually the first page.

**Units.** Bytes versus bits, seconds versus milliseconds, and rates versus totals can make a plausible chart wrong by orders of magnitude.

**Template variables.** Powerful for reuse but can accidentally combine production/staging or hide one failing region. Defaults matter.

**No data.** A missing series can mean “zero events,” “target disappeared,” or “query broken.” Alert rules need explicit semantics.

**Annotations.** Deployment/release markers make temporal correlation visible but are evidence of timing, not proof of causality.

## Production example

A report service dashboard is redesigned around the questions on-call engineers actually ask.

The top row shows accepted-job success, completion SLO, API latency, and oldest pending-job age. The next row shows worker throughput and retry rate. The dependency row shows database pool wait/query latency and object-storage/provider errors.

A deployment annotation marks every production rollout. After a release, p95 completion latency rises. The worker panel shows no CPU saturation, but database pool wait increases. Clicking a panel link opens traces filtered to the same service/version/time window.

The engineer inspects the panel query and confirms it uses route templates and production only. A separate dashboard variable can choose region, but the default does not aggregate production and staging.

For alerting, the team tests target disappearance. Instead of interpreting an empty query as normal, the rule has deliberate no-data behavior and a separate signal for telemetry pipeline failure.

The dashboard therefore supports a diagnostic sequence rather than a collection of screenshots.

## Trade-offs

Shared curated dashboards reduce incident navigation time and encode team knowledge. Over-templated universal dashboards can become so generic that they answer no service-specific questions.

Transformations and expressions can reduce duplication but hide logic from source-control/query review. More panels increase coverage while increasing cognitive load and backend query cost.

## Failure modes / pitfalls

Wrong units, inappropriate averaging, stale copied queries, hidden environment filters, and panels that default to “last six hours” when the incident began days ago can produce false conclusions.

A green panel based on missing data is especially dangerous. Permissions can also expose sensitive log fields or dashboards to users who should not see them.

Dashboards without owners decay as metrics and services change.

## When to use it

Use Grafana for curated operational dashboards, exploratory analysis across telemetry sources, and alerting where its evaluation model fits.

Build dashboards around user impact and common investigation paths rather than the full metric inventory.

## When not to use it

Do not add a panel for every metric. Do not duplicate paging alerts in Grafana and another alert engine without clear ownership of which one is authoritative.

Do not encode critical business calculations only as opaque dashboard transformations if they need stronger testing/governance elsewhere.

## What a Senior Engineer should know

A Senior Engineer should read the actual panel query, verify units and label filters, configure useful drill-down links, and understand no-data/error behavior.

They should validate dashboards during incidents and after metric changes instead of treating visualization as immutable documentation.

## What a Staff Engineer should understand

A Staff Engineer should define dashboard hierarchy, provisioning/version control, access controls, and alert ownership across teams.

They should ensure shared dashboards guide diagnosis consistently while leaving room for domain-specific views and controlling query/retention cost.

Further reading: [Grafana dashboards](https://grafana.com/docs/grafana/latest/dashboards/), [Grafana Alerting: missing data](https://grafana.com/docs/grafana/latest/alerting/guides/missing-data/).
