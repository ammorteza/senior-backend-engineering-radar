---
title: "Prometheus"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Prometheus is a monitoring system and time-series database centered on labeled metrics, a pull-oriented scrape model, PromQL queries, recording rules, and alert rules.

Its data model is simple but powerful: a metric name plus one unique label set identifies a time series. That means metric design is also cardinality design. Adding a user ID label does not “add one dimension”; it may create millions of independent series.

## Why it matters for backend engineers

Metrics are often the first signal during an incident. Poorly designed metrics can be actively misleading: a counter treated as a gauge, a percentile averaged across instances, or missing data interpreted as zero.

Prometheus also consumes resources in proportion to scrape volume, series count, churn, retention, and query complexity. Backend engineers should design instrumentation so it answers operational questions without turning identifiers into a metrics database.

## How it works

Applications expose an HTTP metrics endpoint or exporters expose metrics on their behalf. Prometheus discovers targets and scrapes them at configured intervals. Each sample is stored with labels and timestamp.

A **counter** represents a cumulative value that increases and resets, such as requests. PromQL functions such as `rate()` account for resets over a time window.

A **gauge** represents a current value that can go up or down, such as in-flight requests.

A **classic histogram** records cumulative bucket counters plus sum/count, allowing aggregation and server-side quantile estimation with `histogram_quantile()`. Bucket choice determines resolution.

Prometheus now also supports **native histograms** as a distinct sample type in current versions. Their rollout and scrape/remote-write settings depend on the deployed Prometheus version and configuration; do not assume historical feature-flag behavior still applies.

Recording rules precompute reusable or expensive expressions. Alerting rules evaluate PromQL conditions over time and send alerts to the configured alerting pipeline.

## Key concepts

**Cardinality.** Approximate series count is the product of label value combinations that actually occur. Route templates are usually safe; raw URL paths containing IDs are not.

**Counter resets.** Compute rates per series before aggregating when resets can occur independently. Summing raw counters across instances and then deriving a rate can obscure reset behavior.

**Histogram aggregation.** Classic histogram buckets with the same boundaries can be aggregated across instances. Client-side summaries generally cannot have quantiles aggregated meaningfully.

**Missing versus zero.** If a target disappears, Prometheus may have no current series. A missing error metric is not automatically “zero errors.”

**Staleness.** Prometheus marks series stale when targets stop exposing them. Queries and alerts need explicit no-data behavior.

## Production example

An upload API instruments request duration and errors. The first implementation labels metrics with `path="/files/9f2c..."` and `user_id`. Series count grows rapidly and the monitoring backend becomes expensive.

The team changes dimensions to bounded operational labels:

```text
http_server_request_duration_seconds{
  route="/files/{id}",
  method="GET",
  status_class="2xx"
}
```

Raw file/user IDs remain available in traces and restricted logs.

For latency they use a histogram appropriate to their Prometheus/tooling version and chosen SLO thresholds. An alert evaluates the ratio of failed requests to all eligible requests over a window. A separate alert detects scrape/target absence rather than converting missing data into success.

During an incident, a recording rule provides request rate/error/latency quickly without recomputing an expensive expression across many raw series. The team verifies the panel's PromQL directly and tests a pod restart to confirm counter resets do not create false spikes.

## Trade-offs

Metrics are compact and efficient for rates, distributions, and alerting but cannot reconstruct an individual request's full story.

More labels improve segmentation while increasing series count. Longer retention supports trend analysis while increasing storage. Short scrape intervals improve resolution but increase ingestion and target overhead.

Native histograms can improve histogram flexibility in modern Prometheus, but adoption should be based on current server/client/backend support rather than generic advice.

## Failure modes / pitfalls

Unbounded labels cause cardinality explosions. Using raw `rate` on the wrong aggregation order can mishandle independent resets. Averaging p95 values from separate instances is statistically invalid.

Histograms with poor buckets produce useless quantile resolution. Alert expressions that treat missing data as zero can declare a disappeared service healthy.

Metrics can also leak sensitive information through labels. Never use labels as a convenient log store.

## When to use it

Use Prometheus-style metrics for bounded-dimensional service health, SLOs, resource saturation, queues, and capacity.

Design metrics from questions and alerts, then estimate expected series cardinality before broad rollout.

## When not to use it

Do not store request IDs, user IDs, arbitrary URLs, or high-cardinality business entities as metric labels.

Do not expect metrics to explain a single complex request; use traces/logs for that level of detail.

## What a Senior Engineer should know

A Senior Engineer should choose counter/gauge/histogram types correctly, write reset-safe PromQL, reason about missing data, and estimate series count.

They should inspect query math during incident review rather than trusting a dashboard visualization blindly.

## What a Staff Engineer should understand

A Staff Engineer should set cardinality budgets, retention, recording-rule conventions, alert ownership, and rollout guidance for native/other metric features across teams.

They should align metrics with SLOs and observability cost so the monitoring system remains reliable under the very incidents it is supposed to diagnose.

Further reading: [Prometheus metric types](https://prometheus.io/docs/concepts/metric_types/), [PromQL basics](https://prometheus.io/docs/prometheus/latest/querying/basics/), [Histograms and summaries](https://prometheus.io/docs/practices/histograms/).
