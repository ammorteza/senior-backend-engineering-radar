---
title: "Prometheus"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Prometheus collects labeled time-series metrics and evaluates queries and alert rules. Its pull model commonly scrapes application endpoints at configured intervals.

## Why it matters for backend engineers

Metric design determines which incidents can be diagnosed and how much the monitoring system costs. An unbounded label such as user ID can create millions of series.

## How it works

Targets expose samples; Prometheus stores them with timestamps and label sets. PromQL selects and combines series. Recording rules precompute expensive expressions; alert rules evaluate conditions over time. Scraping failures and staleness affect what a query means, so absence is not the same as zero.

## Key concepts

Counters increase until reset; apply `rate` before aggregating across independently resetting series. Gauges measure current values. Histograms support distributions with a chosen representation; classic histogram quantiles depend on bucket resolution. Labels define series identity and cardinality.

## Production example

An upload service records request duration by route template and result class. It avoids raw file IDs and URL paths. An alert compares failed requests to total requests over a suitable window, while a separate rule detects missing targets. Recording rules keep the dashboard responsive during an incident.

## Trade-offs

Metrics are compact for trends and alerting but omit individual request detail. More dimensions improve diagnosis while multiplying series and retention cost.

## Failure modes / pitfalls

Averaging percentiles, summing counters before calculating rates, high-cardinality labels and treating missing samples as healthy zeros lead to wrong conclusions.

## When to use it

Use Prometheus-style metrics for service health, capacity and bounded-dimensional operational signals.

## When not to use it

Do not use labels as a log store or expect metrics to reconstruct individual user actions.

## What a Senior Engineer should know

Choose metric types, write reset-safe PromQL and estimate series counts.

## What a Staff Engineer should understand

Set cardinality budgets, retention and alert ownership across teams.

Further reading: [Prometheus metric types](https://prometheus.io/docs/concepts/metric_types/), [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/).
