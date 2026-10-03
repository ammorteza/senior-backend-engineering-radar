# Teaching-depth review — started 2026-10-02, updated 2026-10-03

**In progress: 46 of 148 articles reviewed: 45 rewritten and reread, 1 preserved unchanged; 102 remain pending this review.** This is a partial delivery, not a completed repository-wide teaching audit.

The earlier audit removed repeated prose but accepted overly compressed summaries. Its completion statement does not establish the teaching depth requested in this review. No unchanged article is classified as preserved or approved here until it receives the new review.

## Acceptance criteria

- Preserve the eleven required headings and existing radar metadata.
- Explain mechanisms and causal relationships, not only name concepts.
- Define important terms before relying on them; distinguish related mechanisms and limits.
- Give a topic-specific worked scenario with decisions, consequences and verification evidence.
- Explain trade-offs and failure causes sufficiently for a reader to act on them.
- Make Senior and Staff expectations concrete, with different scopes of responsibility.
- Remove filler that could be pasted into an unrelated article. Word count and duplicate scans are supporting signals, not acceptance tests.
- Verify evolving or subtle claims against primary sources; keep illustrative scenarios distinct from documented incidents.

## Rewritten and reread — 45

| Article | Teaching change |
| --- | --- |
| [API security and abuse prevention](../radar/2026-09-29/api-security-and-abuse-prevention.md) | Separates resource/property authorization, SSRF and workload amplification; export example includes adversarial tests. |
| [Authorization models](../radar/2026-09-29/authorization-models.md) | Explains RBAC/ABAC/relationships, trusted scope, revocation and concurrent approval decisions. |
| [Cloud IAM](../radar/2026-09-29/cloud-iam.md) | Traces credentials and effective permissions; distinguishes runtime/deployer authority with denied-operation tests. |
| [Dependency and vulnerability scanning](../radar/2026-09-29/dependency-and-vulnerability-scanning.md) | Follows discovery, applicability, remediation and deployed-artifact verification through an archive-parser scenario. |
| [OAuth 2.0 and OpenID Connect](../radar/2026-09-29/oauth-2-0-and-openid-connect.md) | Explains the code flow, token purposes and validation; wrong-audience scenario includes negative tests. |
| [Policy as code](../radar/2026-09-29/policy-as-code.md) | Teaches decision/enforcement contracts, missing inputs, exceptions and staged admission-policy rollout. |
| [Post-quantum cryptography readiness](../radar/2026-09-29/post-quantum-cryptography-readiness.md) | Separates key establishment, signatures and stored-data migration; works through inventory and interoperability. |
| [Secrets management](../radar/2026-09-29/secrets-management.md) | Explains delivery and reload choices, overlap constraints and pooled-connection failures during rotation. |
| [Secure-by-design development](../radar/2026-09-29/secure-by-design-development.md) | Works through tenant-scoped data-access interfaces, their remaining obligations and safe exception paths. |
| [Software supply-chain security](../radar/2026-09-29/software-supply-chain-security.md) | Distinguishes digests, provenance, inventory and trust policy; demonstrates artifact substitution and verification. |
| [Static analysis and linters](../radar/2026-09-29/static-analysis-and-linters.md) | Explains AST/type/flow analysis and approximation; copied-mutex example connects diagnosis, repair and verification. |
| [Threat modeling](../radar/2026-09-29/threat-modeling.md) | Turns document-import trust boundaries into distinct controls, tests, assumptions and ownership. |
| [Zero trust architecture](../radar/2026-09-29/zero-trust-architecture.md) | Separates network placement, workload identity, delegation and enforcement; demonstrates containment tests. |

| [SQL](../radar/2026-09-29/sql.md) | Explains result grain and join multiplication with a worked invoice aggregate and executable correctness fixture. |
| [EXPLAIN / EXPLAIN ANALYZE](../radar/2026-09-29/explain-explain-analyze.md) | Interprets estimates, loops, buffers and inclusive timing; diagnoses a skewed join and explains execution hazards. |
| [Database indexing and query optimization](../radar/2026-09-29/database-indexing-and-query-optimization.md) | Derives a composite index and stable cursor from a real query; considers write cost and concurrent-build failure. |
| [MVCC and vacuuming](../radar/2026-09-29/mvcc-and-vacuuming.md) | Connects snapshots and cleanup horizons to heartbeat-table growth; distinguishes reusable space from file shrinkage. |
| [Database storage internals](../radar/2026-09-29/database-storage-internals.md) | Contrasts B-tree and LSM maintenance; calculates illustrative write amplification and tests sustained compaction capacity. |
| [PostgreSQL](../radar/2026-09-29/postgresql.md) | Connects engine mechanisms to diagnosis through a migration lock queue and application pool incident. |
| [Database transactions and isolation](../radar/2026-09-29/database-transactions-and-isolation.md) | Works through a conditional last-seat update, a separate cross-row invariant and uncertain commit recovery. |
| [Data modeling and access patterns](../radar/2026-09-29/data-modeling-and-access-patterns.md) | Separates current state, decision history and derived views; makes identity, constraints and access patterns explicit. |
| [Connection pooling](../radar/2026-09-29/connection-pooling.md) | Budgets connections across rollout surge and explains hold-time demand, pool deadlocks and failover retries. |
| [Database replication and failover](../radar/2026-09-29/database-replication-and-failover.md) | Separates replication progress, writer authority and fencing; includes uncertain commits and external-effect reconciliation. |
| [Database migration tools](../radar/2026-09-29/database-migration-tools.md) | Explains expand/contract compatibility, all-writer rollout, concurrent backfill and the limits of rollback. |
| [Horizontal partitioning and sharding](../radar/2026-09-29/horizontal-partitioning-and-sharding.md) | Distinguishes native partitions from shards; works through a hot tenant, routing ownership and fenced cutover. |
| [Backup and disaster recovery](../radar/2026-09-29/backup-and-disaster-recovery.md) | Separates database restore from service recovery; works through selective repair, reconciliation and recovery timing. |
| [Data retention and lifecycle](../radar/2026-09-29/data-retention-and-lifecycle.md) | Distinguishes access expiry from disposal across catalog, object versions, search and restored data. |
| [Redis](../radar/2026-09-29/redis.md) | Explains atomicity, eviction, persistence and cluster placement; diagnoses session eviction and tests fleet-wide cold-cache demand. |
| [Cassandra / Dynamo-style databases](../radar/2026-09-29/cassandra-dynamo-style-databases.md) | Makes Cassandra-specific guarantees explicit; sizes time-bucketed partitions and connects repair to deletion correctness. |
| [BigQuery](../radar/2026-09-29/bigquery.md) | Explains scan work, pruning, clustering and capacity; designs a daily usage summary with late-event correction. |
| [ClickHouse](../radar/2026-09-29/clickhouse.md) | Connects parts, sorting and merges to ingestion; distinguishes replacement identity from uniqueness and tests pre-merge results. |
| [Apache Iceberg](../radar/2026-09-29/apache-iceberg.md) | Traces metadata commits and snapshots; separates partition evolution, file rewriting, expiry and safe orphan cleanup. |
| [Elasticsearch / OpenSearch](../radar/2026-09-29/elasticsearch-opensearch.md) | Explains analysis, mappings and refresh; covers versioned CDC, deletion ordering and validated index rebuilds. |

| [Delivery semantics](../radar/2026-09-29/delivery-semantics.md) | Separates publication, delivery and effects; a crash table explains atomic consumer progress and why ordering remains separate. |
| [Idempotency](../radar/2026-09-29/idempotency.md) | Defines key scope, request fingerprints, concurrent claims and retention; distinguishes local atomicity from provider outcome recovery. |
| [Exactly-once assumptions](../radar/2026-09-29/exactly-once-assumptions.md) | Names Kafka and Pub/Sub guarantee boundaries; tests lost payout responses, duplicate publication and replay after key expiry. |
| [Transactional Outbox](../radar/2026-09-29/transactional-outbox.md) | Explains durable intent, relay claims, immutable payloads and ordering; distinguishes unchanged retries from corrective events. |
| [Change Data Capture](../radar/2026-09-29/change-data-capture.md) | Explains snapshot continuity, source positions, deletes and source-log pressure; works through a live destination rebuild. |
| [Event-driven architecture](../radar/2026-09-29/event-driven-architecture.md) | Explains fan-out, payload choices and product completion states through a recording pipeline with deletion and replay behavior. |
| [Event schema evolution](../radar/2026-09-29/event-schema-evolution.md) | Defines reader/writer compatibility and format-specific rules; works through a units migration that type checking cannot validate. |
| [Apache Kafka](../radar/2026-09-29/apache-kafka.md) | Connects partitions, acknowledgements, offsets and retention to hot-key limits and duplicate-safe database aggregation. |
| [GCP Pub/Sub](../radar/2026-09-29/gcp-pub-sub.md) | Explains subscription ownership, flow control, acknowledgement scope and approximate dead lettering; budgets a shared provider quota. |
| [CloudEvents](../radar/2026-09-29/cloudevents.md) | Explains envelope versus payload and transport modes; includes valid JSON, identity-preserving translation and source authorization tests. |
| [Saga pattern](../radar/2026-09-29/saga-pattern.md) | Models durable workflow states, uncertain outcomes, failed compensation and late replies without assuming rollback or global isolation. |
| [Event sourcing](../radar/2026-09-29/event-sourcing.md) | Distinguishes authoritative history from audit and integration events; explains expected-version appends, temporal meaning and safe projection replay. |

## Preserved unchanged — 1

[Managed relational databases](../radar/2026-09-29/managed-relational-databases.md) already explains shared responsibility, control plane versus engine, topology, maintenance, recovery and cost with a concrete operating example. Reread and retained byte-for-byte.

## Validation

Messaging pass (2026-10-03): twelve articles expanded, reread and checked against primary specifications and provider documentation. Strict build passed with 148 entries and 158 pages. All rendered article routes retain the required headings; the twelve revised openings and delivery crash table were verified in HTML. CloudEvents example JSON parses and includes the required envelope attributes. All metadata, section, code-fence and duplicate-prose checks passed. No live broker/provider integration or crash-injection tests were run; the articles describe illustrative validation scenarios, not measured production results.


Latest pass (2026-10-03): strict build succeeded with 148 entries and 158 generated pages. All article routes retain the eleven headings, and the 20 new expanded openings appear in rendered HTML. Metadata, section structure and duplicate-prose checks passed across all 148 entries. The managed-relational-databases article is byte-identical to the previous commit.

The SQL aggregation example was executed against a small SQLite fixture to verify portable join/aggregate behavior, including tenant filtering and missing child rows. This does not validate PostgreSQL-specific execution plans or concurrent transaction behavior; PostgreSQL is not installed in this environment. Those examples were checked against PostgreSQL documentation.

Deployment follow-up: CI twice failed in the upstream Google Fonts URL parser after successful content generation. A small build adapter now uses bundled, licensed Roboto Latin through `next/font/local`; the strict build and rendered-route checks passed again. No article metadata or bodies changed in this follow-up.

Previous security-group validation (2026-10-02):

- Strict build passed: all 148 entries, compilation, lint/type checking and 158 generated static pages.
- All 148 article routes contain the required headings. Expanded openings and the final PQC corrections are present in rendered HTML.
- All article metadata and exact heading sequences match the baseline; no empty sections or exact repeated prose paragraphs of 20+ words. This is structural validation, not an editorial quality score.
- `git diff --check` passed. There is no dedicated application test command in this repository.
- Code fragments are illustrative; this environment does not provide a Go compiler, so they were reviewed but not compiled here.
- The existing disposable builder uses Node's tsx loader to avoid the environment's blocked IPC socket. A stale output-directory cleanup error was resolved by moving generated output aside; the final build exited successfully. No dependency or builder-source changes are part of this delivery.

## Pending review — 102

These entries are inventoried for continuation. This list does not assert that their bodies have been reread or that they meet the new standard.

- [Agent evaluation and verification](../radar/2026-09-29/agent-evaluation-and-verification.md)
- [Agent observability](../radar/2026-09-29/agent-observability.md)
- [Agent security and sandboxing](../radar/2026-09-29/agent-security-and-sandboxing.md)
- [Agent Skills](../radar/2026-09-29/agent-skills.md)
- [AI-assisted software engineering](../radar/2026-09-29/ai-assisted-software-engineering.md)
- [AI tool calling and structured outputs](../radar/2026-09-29/ai-tool-calling-and-structured-outputs.md)
- [API design and evolution](../radar/2026-09-29/api-design-and-evolution.md)
- [API gateway pattern](../radar/2026-09-29/api-gateway-pattern.md)
- [Architecture Decision Records](../radar/2026-09-29/architecture-decision-records.md)
- [AWS](../radar/2026-09-29/aws.md)
- [Bash / shell scripting](../radar/2026-09-29/bash-shell-scripting.md)
- [Caching strategies](../radar/2026-09-29/caching-strategies.md)
- [Capacity planning](../radar/2026-09-29/capacity-planning.md)
- [Chaos engineering](../radar/2026-09-29/chaos-engineering.md)
- [Circuit breakers](../radar/2026-09-29/circuit-breakers.md)
- [Cloudflare](../radar/2026-09-29/cloudflare.md)
- [Coding agents](../radar/2026-09-29/coding-agents.md)
- [Coding throughput as productivity](../radar/2026-09-29/coding-throughput-as-productivity.md)
- [Concurrency control](../radar/2026-09-29/concurrency-control.md)
- [Consensus and Raft](../radar/2026-09-29/consensus-and-raft.md)
- [Containers](../radar/2026-09-29/containers.md)
- [Content delivery networks](../radar/2026-09-29/content-delivery-networks.md)
- [Context engineering](../radar/2026-09-29/context-engineering.md)
- [Cost-aware architecture / FinOps](../radar/2026-09-29/cost-aware-architecture-finops.md)
- [CQRS](../radar/2026-09-29/cqrs.md)
- [CRDTs](../radar/2026-09-29/crdts.md)
- [Data contracts](../radar/2026-09-29/data-contracts.md)
- [Delve](../radar/2026-09-29/delve.md)
- [Dev Containers](../radar/2026-09-29/dev-containers.md)
- [Distributed locking](../radar/2026-09-29/distributed-locking.md)
- [Distributed systems fundamentals](../radar/2026-09-29/distributed-systems-fundamentals.md)
- [Distributed tracing context propagation](../radar/2026-09-29/distributed-tracing-context-propagation.md)
- [DNS](../radar/2026-09-29/dns.md)
- [Docker](../radar/2026-09-29/docker.md)
- [Domain-driven design](../radar/2026-09-29/domain-driven-design.md)
- [DORA metrics](../radar/2026-09-29/dora-metrics.md)
- [Durable agent workflows](../radar/2026-09-29/durable-agent-workflows.md)
- [eBPF observability tools](../radar/2026-09-29/ebpf-observability-tools.md)
- [Evolutionary architecture](../radar/2026-09-29/evolutionary-architecture.md)
- [Feature flags](../radar/2026-09-29/feature-flags.md)
- [Git](../radar/2026-09-29/git.md)
- [GitHub Actions](../radar/2026-09-29/github-actions.md)
- [Go execution tracer](../radar/2026-09-29/go-execution-tracer.md)
- [Go pprof](../radar/2026-09-29/go-pprof.md)
- [Go](../radar/2026-09-29/go.md)
- [Google Cloud Platform](../radar/2026-09-29/google-cloud-platform.md)
- [Graceful degradation](../radar/2026-09-29/graceful-degradation.md)
- [Grafana](../radar/2026-09-29/grafana.md)
- [gRPC](../radar/2026-09-29/grpc.md)
- [Helm](../radar/2026-09-29/helm.md)
- [HTTP](../radar/2026-09-29/http.md)
- [Incident response and blameless postmortems](../radar/2026-09-29/incident-response-and-blameless-postmortems.md)
- [JSON Schema](../radar/2026-09-29/json-schema.md)
- [k6](../radar/2026-09-29/k6.md)
- [Kubernetes](../radar/2026-09-29/kubernetes.md)
- [Linux](../radar/2026-09-29/linux.md)
- [Load and performance testing](../radar/2026-09-29/load-and-performance-testing.md)
- [Load balancing](../radar/2026-09-29/load-balancing.md)
- [Local Kubernetes environments](../radar/2026-09-29/local-kubernetes-environments.md)
- [Logical clocks and causal ordering](../radar/2026-09-29/logical-clocks-and-causal-ordering.md)
- [Make / task runners](../radar/2026-09-29/make-task-runners.md)
- [Memory management and garbage collection](../radar/2026-09-29/memory-management-and-garbage-collection.md)
- [Microservices](../radar/2026-09-29/microservices.md)
- [Model Context Protocol (MCP)](../radar/2026-09-29/model-context-protocol-mcp.md)
- [Model routing and AI gateways](../radar/2026-09-29/model-routing-and-ai-gateways.md)
- [Modular monolith](../radar/2026-09-29/modular-monolith.md)
- [Multi-region architecture](../radar/2026-09-29/multi-region-architecture.md)
- [Object storage](../radar/2026-09-29/object-storage.md)
- [Observability](../radar/2026-09-29/observability.md)
- [OpenAPI](../radar/2026-09-29/openapi.md)
- [OpenTelemetry](../radar/2026-09-29/opentelemetry.md)
- [OS scheduling and resource isolation](../radar/2026-09-29/os-scheduling-and-resource-isolation.md)
- [Platform engineering](../radar/2026-09-29/platform-engineering.md)
- [Premature microservice decomposition](../radar/2026-09-29/premature-microservice-decomposition.md)
- [Progressive delivery](../radar/2026-09-29/progressive-delivery.md)
- [Prometheus](../radar/2026-09-29/prometheus.md)
- [Protocol Buffers](../radar/2026-09-29/protocol-buffers.md)
- [Python](../radar/2026-09-29/python.md)
- [Queues and load shedding](../radar/2026-09-29/queues-and-load-shedding.md)
- [RAG architecture](../radar/2026-09-29/rag-architecture.md)
- [Rate limiting and backpressure](../radar/2026-09-29/rate-limiting-and-backpressure.md)
- [Regular expressions](../radar/2026-09-29/regular-expressions.md)
- [Replication and consistency models](../radar/2026-09-29/replication-and-consistency-models.md)
- [Repository instructions for coding agents](../radar/2026-09-29/repository-instructions-for-coding-agents.md)
- [Serverless platforms](../radar/2026-09-29/serverless-platforms.md)
- [Service discovery](../radar/2026-09-29/service-discovery.md)
- [Service mesh by default](../radar/2026-09-29/service-mesh-by-default.md)
- [Service mesh](../radar/2026-09-29/service-mesh.md)
- [SLIs, SLOs and error budgets](../radar/2026-09-29/slis-slos-and-error-budgets.md)
- [Strangler Fig migration](../radar/2026-09-29/strangler-fig-migration.md)
- [Stream processing](../radar/2026-09-29/stream-processing.md)
- [TCP and connection lifecycle](../radar/2026-09-29/tcp-and-connection-lifecycle.md)
- [Temporal](../radar/2026-09-29/temporal.md)
- [Terraform / OpenTofu](../radar/2026-09-29/terraform-opentofu.md)
- [Timeouts, retries and jitter](../radar/2026-09-29/timeouts-retries-and-jitter.md)
- [TLS and PKI](../radar/2026-09-29/tls-and-pki.md)
- [Trunk-based development](../radar/2026-09-29/trunk-based-development.md)
- [Unbounded retries and queues](../radar/2026-09-29/unbounded-retries-and-queues.md)
- [Vector databases](../radar/2026-09-29/vector-databases.md)
- [WebAssembly](../radar/2026-09-29/webassembly.md)
- [WebSockets and Server-Sent Events](../radar/2026-09-29/websockets-and-server-sent-events.md)
- [Workflow orchestration](../radar/2026-09-29/workflow-orchestration.md)
