---
title: "Grafana"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Grafana queries telemetry backends and presents dashboards, exploration views and alerts. It is a visualization layer; the accuracy of its panels depends on the underlying data and queries.

## Why it matters for backend engineers

A dashboard should help an on-call engineer choose the next investigation. A wall of unrelated graphs can obscure the difference between user impact and a noisy infrastructure metric.

## How it works

Panels query sources such as Prometheus or a log store, optionally apply transformations, and render results. Variables select service, environment or instance. Provisioned dashboards keep definitions reviewable. Grafana alerting has its own evaluation and data-source constraints, which should be understood separately from Prometheus rules.

## Key concepts

Units, aggregation windows and label filters must be explicit. Deployment annotations connect symptoms to changes. Dashboard links should lead from fleet health to instances, logs and traces. No-data behavior needs deliberate alert policy.

## Production example

A report API dashboard starts with success rate and latency, then shows worker backlog, database pool waits and query duration. A deployment annotation aligns a latency increase with a new release; a panel link opens the affected query's logs. The engineer can follow a hypothesis rather than browse every host graph.

## Trade-offs

Shared dashboards reduce incident navigation cost. Excess templating and transformations can make queries hard to reason about or silently hide missing data.

## Failure modes / pitfalls

Wrong units, averages hiding tails, stale copied queries and panels mixing environments produce misleading reassurance. Dashboard permissions can expose sensitive logs.

## When to use it

Use Grafana for curated diagnostic views and exploratory correlation across telemetry sources.

## When not to use it

Do not create a panel for every available metric or duplicate paging rules without deciding who owns them.

## What a Senior Engineer should know

Read the actual panel query, verify units and provide useful drill-down paths.

## What a Staff Engineer should understand

Define a dashboard information hierarchy and telemetry access model across teams.

Further reading: [Grafana dashboards](https://grafana.com/docs/grafana/latest/dashboards/).
