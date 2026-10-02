# Teaching-depth review — 2026-10-02

**In progress: 13 of 148 articles rewritten and reread; 135 remain pending this review.** This is a partial delivery, not a completed repository-wide teaching audit.

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

## Rewritten and reread — 13

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

## Validation

- Strict build passed: all 148 entries, compilation, lint/type checking and 158 generated static pages.
- All 148 article routes contain the required headings. Expanded openings and the final PQC corrections are present in rendered HTML.
- All article metadata and exact heading sequences match the baseline; no empty sections or exact repeated prose paragraphs of 20+ words. This is structural validation, not an editorial quality score.
- `git diff --check` passed. There is no dedicated application test command in this repository.
- Code fragments are illustrative; this environment does not provide a Go compiler, so they were reviewed but not compiled here.
- The existing disposable builder uses Node's tsx loader to avoid the environment's blocked IPC socket. A stale output-directory cleanup error was resolved by moving generated output aside; the final build exited successfully. No dependency or builder-source changes are part of this delivery.

## Pending review — 135

These entries are inventoried for continuation. This list does not assert that their bodies have been reread or that they meet the new standard.

- [Agent evaluation and verification](../radar/2026-09-29/agent-evaluation-and-verification.md)
- [Agent observability](../radar/2026-09-29/agent-observability.md)
- [Agent security and sandboxing](../radar/2026-09-29/agent-security-and-sandboxing.md)
- [Agent Skills](../radar/2026-09-29/agent-skills.md)
- [AI-assisted software engineering](../radar/2026-09-29/ai-assisted-software-engineering.md)
- [AI tool calling and structured outputs](../radar/2026-09-29/ai-tool-calling-and-structured-outputs.md)
- [Apache Iceberg](../radar/2026-09-29/apache-iceberg.md)
- [Apache Kafka](../radar/2026-09-29/apache-kafka.md)
- [API design and evolution](../radar/2026-09-29/api-design-and-evolution.md)
- [API gateway pattern](../radar/2026-09-29/api-gateway-pattern.md)
- [Architecture Decision Records](../radar/2026-09-29/architecture-decision-records.md)
- [AWS](../radar/2026-09-29/aws.md)
- [Backup and disaster recovery](../radar/2026-09-29/backup-and-disaster-recovery.md)
- [Bash / shell scripting](../radar/2026-09-29/bash-shell-scripting.md)
- [BigQuery](../radar/2026-09-29/bigquery.md)
- [Caching strategies](../radar/2026-09-29/caching-strategies.md)
- [Capacity planning](../radar/2026-09-29/capacity-planning.md)
- [Cassandra / Dynamo-style databases](../radar/2026-09-29/cassandra-dynamo-style-databases.md)
- [Change Data Capture](../radar/2026-09-29/change-data-capture.md)
- [Chaos engineering](../radar/2026-09-29/chaos-engineering.md)
- [Circuit breakers](../radar/2026-09-29/circuit-breakers.md)
- [ClickHouse](../radar/2026-09-29/clickhouse.md)
- [CloudEvents](../radar/2026-09-29/cloudevents.md)
- [Cloudflare](../radar/2026-09-29/cloudflare.md)
- [Coding agents](../radar/2026-09-29/coding-agents.md)
- [Coding throughput as productivity](../radar/2026-09-29/coding-throughput-as-productivity.md)
- [Concurrency control](../radar/2026-09-29/concurrency-control.md)
- [Connection pooling](../radar/2026-09-29/connection-pooling.md)
- [Consensus and Raft](../radar/2026-09-29/consensus-and-raft.md)
- [Containers](../radar/2026-09-29/containers.md)
- [Content delivery networks](../radar/2026-09-29/content-delivery-networks.md)
- [Context engineering](../radar/2026-09-29/context-engineering.md)
- [Cost-aware architecture / FinOps](../radar/2026-09-29/cost-aware-architecture-finops.md)
- [CQRS](../radar/2026-09-29/cqrs.md)
- [CRDTs](../radar/2026-09-29/crdts.md)
- [Data contracts](../radar/2026-09-29/data-contracts.md)
- [Data modeling and access patterns](../radar/2026-09-29/data-modeling-and-access-patterns.md)
- [Data retention and lifecycle](../radar/2026-09-29/data-retention-and-lifecycle.md)
- [Database indexing and query optimization](../radar/2026-09-29/database-indexing-and-query-optimization.md)
- [Database migration tools](../radar/2026-09-29/database-migration-tools.md)
- [Database replication and failover](../radar/2026-09-29/database-replication-and-failover.md)
- [Database storage internals](../radar/2026-09-29/database-storage-internals.md)
- [Database transactions and isolation](../radar/2026-09-29/database-transactions-and-isolation.md)
- [Delivery semantics](../radar/2026-09-29/delivery-semantics.md)
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
- [Elasticsearch / OpenSearch](../radar/2026-09-29/elasticsearch-opensearch.md)
- [Event-driven architecture](../radar/2026-09-29/event-driven-architecture.md)
- [Event schema evolution](../radar/2026-09-29/event-schema-evolution.md)
- [Event sourcing](../radar/2026-09-29/event-sourcing.md)
- [Evolutionary architecture](../radar/2026-09-29/evolutionary-architecture.md)
- [Exactly-once assumptions](../radar/2026-09-29/exactly-once-assumptions.md)
- [EXPLAIN / EXPLAIN ANALYZE](../radar/2026-09-29/explain-explain-analyze.md)
- [Feature flags](../radar/2026-09-29/feature-flags.md)
- [GCP Pub/Sub](../radar/2026-09-29/gcp-pub-sub.md)
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
- [Horizontal partitioning and sharding](../radar/2026-09-29/horizontal-partitioning-and-sharding.md)
- [HTTP](../radar/2026-09-29/http.md)
- [Idempotency](../radar/2026-09-29/idempotency.md)
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
- [Managed relational databases](../radar/2026-09-29/managed-relational-databases.md)
- [Memory management and garbage collection](../radar/2026-09-29/memory-management-and-garbage-collection.md)
- [Microservices](../radar/2026-09-29/microservices.md)
- [Model Context Protocol (MCP)](../radar/2026-09-29/model-context-protocol-mcp.md)
- [Model routing and AI gateways](../radar/2026-09-29/model-routing-and-ai-gateways.md)
- [Modular monolith](../radar/2026-09-29/modular-monolith.md)
- [Multi-region architecture](../radar/2026-09-29/multi-region-architecture.md)
- [MVCC and vacuuming](../radar/2026-09-29/mvcc-and-vacuuming.md)
- [Object storage](../radar/2026-09-29/object-storage.md)
- [Observability](../radar/2026-09-29/observability.md)
- [OpenAPI](../radar/2026-09-29/openapi.md)
- [OpenTelemetry](../radar/2026-09-29/opentelemetry.md)
- [OS scheduling and resource isolation](../radar/2026-09-29/os-scheduling-and-resource-isolation.md)
- [Platform engineering](../radar/2026-09-29/platform-engineering.md)
- [PostgreSQL](../radar/2026-09-29/postgresql.md)
- [Premature microservice decomposition](../radar/2026-09-29/premature-microservice-decomposition.md)
- [Progressive delivery](../radar/2026-09-29/progressive-delivery.md)
- [Prometheus](../radar/2026-09-29/prometheus.md)
- [Protocol Buffers](../radar/2026-09-29/protocol-buffers.md)
- [Python](../radar/2026-09-29/python.md)
- [Queues and load shedding](../radar/2026-09-29/queues-and-load-shedding.md)
- [RAG architecture](../radar/2026-09-29/rag-architecture.md)
- [Rate limiting and backpressure](../radar/2026-09-29/rate-limiting-and-backpressure.md)
- [Redis](../radar/2026-09-29/redis.md)
- [Regular expressions](../radar/2026-09-29/regular-expressions.md)
- [Replication and consistency models](../radar/2026-09-29/replication-and-consistency-models.md)
- [Repository instructions for coding agents](../radar/2026-09-29/repository-instructions-for-coding-agents.md)
- [Saga pattern](../radar/2026-09-29/saga-pattern.md)
- [Serverless platforms](../radar/2026-09-29/serverless-platforms.md)
- [Service discovery](../radar/2026-09-29/service-discovery.md)
- [Service mesh by default](../radar/2026-09-29/service-mesh-by-default.md)
- [Service mesh](../radar/2026-09-29/service-mesh.md)
- [SLIs, SLOs and error budgets](../radar/2026-09-29/slis-slos-and-error-budgets.md)
- [SQL](../radar/2026-09-29/sql.md)
- [Strangler Fig migration](../radar/2026-09-29/strangler-fig-migration.md)
- [Stream processing](../radar/2026-09-29/stream-processing.md)
- [TCP and connection lifecycle](../radar/2026-09-29/tcp-and-connection-lifecycle.md)
- [Temporal](../radar/2026-09-29/temporal.md)
- [Terraform / OpenTofu](../radar/2026-09-29/terraform-opentofu.md)
- [Timeouts, retries and jitter](../radar/2026-09-29/timeouts-retries-and-jitter.md)
- [TLS and PKI](../radar/2026-09-29/tls-and-pki.md)
- [Transactional Outbox](../radar/2026-09-29/transactional-outbox.md)
- [Trunk-based development](../radar/2026-09-29/trunk-based-development.md)
- [Unbounded retries and queues](../radar/2026-09-29/unbounded-retries-and-queues.md)
- [Vector databases](../radar/2026-09-29/vector-databases.md)
- [WebAssembly](../radar/2026-09-29/webassembly.md)
- [WebSockets and Server-Sent Events](../radar/2026-09-29/websockets-and-server-sent-events.md)
- [Workflow orchestration](../radar/2026-09-29/workflow-orchestration.md)
