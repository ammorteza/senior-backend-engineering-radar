# Repository-wide editorial audit — 2026-10-02

> Historical report: this pass was subsequently found to be too shallow. Its completion claim is not teaching-quality acceptance. See the [current, incomplete teaching-depth review](teaching-depth-review-2026-10-02.md) for accurate progress.

Reviewed all **148 blips** in `radar/2026-09-29/`: **125 rewritten**, **2 narrowly corrected**, **21 preserved byte-for-byte**. Blip IDs, front matter, rings, tags, quadrants and portable exports were retained.

The rewritten articles replace repeated generic prose and unrelated key concepts with subject-specific mechanics, distinct illustrative production scenarios, concrete limitations and role expectations. Examples teach plausible production situations; they do not claim undocumented personal experience or measured project results.

All articles retain the requested eleven headings. The second editorial pass examined mechanisms, examples and pitfalls for transferable boilerplate and technical overclaims. Exact duplicate checks supplement that review; they do not establish semantic quality on their own.

## Validation

- Strict AOE data generation: all 148 entries accepted.
- Production site build: compilation, lint/type checking and all 158 static pages passed.
- Original `npm run build` first hit this environment's blocked tsx IPC socket. Only the disposable `.techradar` builder launcher was changed to `node --import tsx`; the same strict data script and Next build then passed. No launcher or dependency change is included in this commit.
- All 148 heading sequences and front-matter values checked against the original; no empty required sections.
- No exact duplicate prose paragraphs of 15 or more words; original boilerplate markers removed.
- `git diff --check` passed. There is no dedicated application test command in this content repository.

## Authoritative references checked for evolving or subtle claims

- [Go analysis API](https://pkg.go.dev/golang.org/x/tools/go/analysis), [gopls analyzers](https://go.dev/gopls/analyzers), [Staticcheck](https://staticcheck.dev/docs/): analyzer mechanics and tooling boundaries.
- [PostgreSQL documentation](https://www.postgresql.org/docs/current/): EXPLAIN execution, vacuum/reclamation and replication/failover boundaries.
- [GNU Make manual](https://www.gnu.org/software/make/manual/make.html): checked the preserved target, timestamp, phony and shell explanations.
- [Cloud SQL HA](https://docs.cloud.google.com/sql/docs/postgres/high-availability): checked the preserved managed database responsibility/topology discussion.
- [Pub/Sub delivery](https://docs.cloud.google.com/pubsub/docs/exactly-once-delivery): scoped pull and regional guarantees, not external-effect atomicity.
- [DORA guidance](https://dora.dev/guides/dora-metrics/): current five-metric model, rather than assuming the historical four keys.
- [NIST PQC](https://csrc.nist.gov/projects/post-quantum-cryptography): finalized key-encapsulation versus signature standards.
- [OAuth RFC 9700](https://www.rfc-editor.org/rfc/rfc9700): current security guidance and token-validation boundaries.
- [MCP 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization), [Agent Skills](https://agentskills.io/specification): versioned integration and skill structure; no blanket trust guarantees.
- [Kubernetes resource/probe documentation](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/), [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/), [Iceberg specification](https://iceberg.apache.org/spec/), [Python threading](https://docs.python.org/3/library/threading.html): resource behavior and product/runtime distinctions.
- [OWASP API security](https://owasp.org/API-Security/editions/2023/en/0x11-t10/), [SLSA](https://slsa.dev/spec/v1.2/), [NIST zero trust](https://csrc.nist.gov/pubs/sp/800/207/final), [SRE SLO alerting](https://sre.google/workbook/alerting-on-slos/): security and reliability scope.

Each rewritten article includes further reading relevant to its own subject. Specifications and products can evolve; version-sensitive claims should be rechecked during subsequent maintenance.

## Rewritten — 125

| Blip | Mechanics now taught |
| --- | --- |
| [Agent evaluation and verification](../radar/2026-09-29/agent-evaluation-and-verification.md) | Build a task set with expected outcomes, realistic environments and held-out cases. |
| [Agent observability](../radar/2026-09-29/agent-observability.md) | Assign a run identity, trace model and tool operations, and capture versions, timings, token usage and structured outcomes. |
| [Agent security and sandboxing](../radar/2026-09-29/agent-security-and-sandboxing.md) | Treat retrieved content and tool results as untrusted. |
| [Agent Skills](../radar/2026-09-29/agent-skills.md) | A host discovers skill metadata, selects a relevant skill and loads its body. |
| [AI-assisted software engineering](../radar/2026-09-29/ai-assisted-software-engineering.md) | Give the assistant a bounded goal, relevant code and constraints. |
| [AI tool calling and structured outputs](../radar/2026-09-29/ai-tool-calling-and-structured-outputs.md) | Present clear tool descriptions and schemas. |
| [Apache Iceberg](../radar/2026-09-29/apache-iceberg.md) | A catalog identifies the current table metadata. |
| [Apache Kafka](../radar/2026-09-29/apache-kafka.md) | Producers append to partition leaders; followers replicate the log. |
| [API gateway pattern](../radar/2026-09-29/api-gateway-pattern.md) | The gateway terminates supported protocols, selects upstream routes and applies policies such as token validation, request-size limits and rate limits. |
| [API security and abuse prevention](../radar/2026-09-29/api-security-and-abuse-prevention.md) | Validate identity, authorize each requested object and action, constrain input and resource use, then enforce business rules. |
| [Architecture Decision Records](../radar/2026-09-29/architecture-decision-records.md) | Write a short record near the decision: problem, relevant constraints, options, selected choice and consequences. |
| [Authorization models](../radar/2026-09-29/authorization-models.md) | A policy enforcement point asks for a decision using principal, resource, action and relevant context. |
| [AWS](../radar/2026-09-29/aws.md) | Workloads use services such as EC2, ECS, EKS or Lambda. |
| [Backup and disaster recovery](../radar/2026-09-29/backup-and-disaster-recovery.md) | Choose recovery point and recovery time objectives, then design snapshots, log archives and independent copies accordingly. |
| [Bash / shell scripting](../radar/2026-09-29/bash-shell-scripting.md) | The shell performs expansions before launching commands. |
| [BigQuery](../radar/2026-09-29/bigquery.md) | Data is stored in analytical tables and queried through distributed execution. |
| [Capacity planning](../radar/2026-09-29/capacity-planning.md) | Describe request mix and peaks, calculate rough compute, memory, connection and storage demand, then measure a representative workload. |
| [Cassandra / Dynamo-style databases](../radar/2026-09-29/cassandra-dynamo-style-databases.md) | In Cassandra, partitioning maps keys to replica sets. |
| [Change Data Capture](../radar/2026-09-29/change-data-capture.md) | A connector typically takes an initial snapshot and then streams log changes from a recorded position. |
| [Chaos engineering](../radar/2026-09-29/chaos-engineering.md) | Define expected user-visible behavior, select one failure and limit the initial scope. |
| [ClickHouse](../radar/2026-09-29/clickhouse.md) | MergeTree-family tables store sorted data parts and merge them in the background. |
| [Cloud IAM](../radar/2026-09-29/cloud-iam.md) | An identity obtains credentials and presents them to a service. |
| [CloudEvents](../radar/2026-09-29/cloudevents.md) | An event carries required `specversion`, `id`, `source` and `type` attributes. |
| [Cloudflare](../radar/2026-09-29/cloudflare.md) | DNS directs traffic according to record configuration. |
| [Coding agents](../radar/2026-09-29/coding-agents.md) | The agent receives a goal, reads relevant files, invokes tools and iterates based on their outputs. |
| [Coding throughput as productivity](../radar/2026-09-29/coding-throughput-as-productivity.md) | Evaluate outcomes and flow: the customer problem solved, time to usable delivery, defects, operational burden and maintainability. |
| [Consensus and Raft](../radar/2026-09-29/consensus-and-raft.md) | A candidate increments its term and requests votes. |
| [Containers](../radar/2026-09-29/containers.md) | A runtime unpacks image layers and launches a process with namespaces and cgroup controls. |
| [Content delivery networks](../radar/2026-09-29/content-delivery-networks.md) | An edge receives a request, selects a cache entry under its key and freshness rules, and fetches or revalidates against the origin when needed. |
| [Context engineering](../radar/2026-09-29/context-engineering.md) | Identify what changes the decision, retrieve that material and preserve its provenance. |
| [Cost-aware architecture / FinOps](../radar/2026-09-29/cost-aware-architecture-finops.md) | Attribute usage to products or workloads, establish unit costs, and identify the drivers: compute time, stored bytes, queries, requests and network transfer. |
| [CQRS](../radar/2026-09-29/cqrs.md) | Commands validate intent and update the authoritative write model. |
| [CRDTs](../radar/2026-09-29/crdts.md) | State-based CRDTs merge states using an associative, commutative and idempotent join over an appropriate lattice. |
| [Data contracts](../radar/2026-09-29/data-contracts.md) | Producers and consumers agree on fields, units, identifiers, update/deletion semantics and freshness expectations. |
| [Data retention and lifecycle](../radar/2026-09-29/data-retention-and-lifecycle.md) | Classify datasets and define operational retention requirements with appropriate organizational input. |
| [Database migration tools](../radar/2026-09-29/database-migration-tools.md) | A runner discovers migration files, checks its history table and applies pending changes under its locking and transaction rules. |
| [Database replication and failover](../radar/2026-09-29/database-replication-and-failover.md) | PostgreSQL physical standbys replay WAL from the primary and share its storage-level representation. |
| [Database storage internals](../radar/2026-09-29/database-storage-internals.md) | A B-tree maintains ordered pages and navigates from root to leaf; modifications may split pages. |
| [Delve](../radar/2026-09-29/delve.md) | Delve launches or attaches to a process and controls execution through debug facilities. |
| [Dependency and vulnerability scanning](../radar/2026-09-29/dependency-and-vulnerability-scanning.md) | Tools inspect manifests, lockfiles, source or images, identify components and match advisory version ranges. |
| [Dev Containers](../radar/2026-09-29/dev-containers.md) | A dev-container configuration selects or builds an image, mounts source and defines users, features and lifecycle commands. |
| [Distributed locking](../radar/2026-09-29/distributed-locking.md) | An actor acquires ownership through a coordination service, renews before expiry and releases conditionally using its ownership token. |
| [Distributed tracing context propagation](../radar/2026-09-29/distributed-tracing-context-propagation.md) | A caller injects trace context into transport metadata; the receiver extracts it and creates an appropriate span. |
| [Docker](../radar/2026-09-29/docker.md) | Build instructions consume a context and create reusable layers. |
| [Domain-driven design](../radar/2026-09-29/domain-driven-design.md) | Engineers and domain experts develop a ubiquitous language within a bounded context. |
| [DORA metrics](../radar/2026-09-29/dora-metrics.md) | Collect consistent events for commits, deployments and deployment-related interventions. |
| [Durable agent workflows](../radar/2026-09-29/durable-agent-workflows.md) | Record workflow state, selected actions and tool outcomes at explicit boundaries. |
| [eBPF observability tools](../radar/2026-09-29/ebpf-observability-tools.md) | Tools attach programs to supported hooks such as tracepoints, kprobes or uprobes. |
| [Elasticsearch / OpenSearch](../radar/2026-09-29/elasticsearch-opensearch.md) | Mappings define field types and analyzers tokenize text into terms. |
| [Event schema evolution](../radar/2026-09-29/event-schema-evolution.md) | Identify which readers must read which writers' data. |
| [Event sourcing](../radar/2026-09-29/event-sourcing.md) | An aggregate loads its event stream, reconstructs state and validates a command. |
| [Evolutionary architecture](../radar/2026-09-29/evolutionary-architecture.md) | Identify characteristics such as tenant isolation, bounded latency or module independence. |
| [Exactly-once assumptions](../radar/2026-09-29/exactly-once-assumptions.md) | Draw the operation's commit points. |
| [EXPLAIN / EXPLAIN ANALYZE](../radar/2026-09-29/explain-explain-analyze.md) | Read the tree from child operations toward their parents. |
| [Feature flags](../radar/2026-09-29/feature-flags.md) | The application evaluates a flag using a defined key, context and default. |
| [GCP Pub/Sub](../radar/2026-09-29/gcp-pub-sub.md) | Publishers submit messages to a topic. |
| [Git](../radar/2026-09-29/git.md) | Blobs store file content, trees describe directory snapshots and commits reference a tree plus parents. |
| [GitHub Actions](../radar/2026-09-29/github-actions.md) | Events select a workflow; jobs run on hosted or self-hosted runners with dependency ordering. |
| [Go execution tracer](../radar/2026-09-29/go-execution-tracer.md) | A trace records events during a bounded capture and is analyzed with `go tool trace`. |
| [Go pprof](../radar/2026-09-29/go-pprof.md) | CPU profiling samples active stacks over an interval. |
| [Go](../radar/2026-09-29/go.md) | The runtime schedules goroutines over operating-system threads using logical processors controlled by `GOMAXPROCS`. |
| [Google Cloud Platform](../radar/2026-09-29/google-cloud-platform.md) | Resources belong to projects under organizational policy. |
| [Graceful degradation](../radar/2026-09-29/graceful-degradation.md) | Classify request dependencies by whether they are essential. |
| [Grafana](../radar/2026-09-29/grafana.md) | Panels query sources such as Prometheus or a log store, optionally apply transformations, and render results. |
| [gRPC](../radar/2026-09-29/grpc.md) | A client serializes a request and sends it through a channel; the server dispatches to a handler and returns a status plus response. |
| [Helm](../radar/2026-09-29/helm.md) | Helm renders templates with supplied values, then installs or upgrades resources. |
| [HTTP](../radar/2026-09-29/http.md) | Clients send a method, target, headers and optional content. |
| [Incident response and blameless postmortems](../radar/2026-09-29/incident-response-and-blameless-postmortems.md) | Declare impact and roles, maintain a timeline and prioritize reversible mitigation. |
| [JSON Schema](../radar/2026-09-29/json-schema.md) | A validator evaluates an instance against schema assertions. |
| [k6](../radar/2026-09-29/k6.md) | Virtual users execute scripted operations. |
| [Kubernetes](../radar/2026-09-29/kubernetes.md) | The API server stores desired objects; controllers compare them with observed state. |
| [Linux](../radar/2026-09-29/linux.md) | Processes execute threads, access files through descriptors and communicate through sockets. |
| [Load and performance testing](../radar/2026-09-29/load-and-performance-testing.md) | Model arrivals, operations and datasets, then generate controlled demand while measuring errors, latency and resource saturation. |
| [Local Kubernetes environments](../radar/2026-09-29/local-kubernetes-environments.md) | kind commonly runs cluster nodes as containers; minikube supports multiple drivers. |
| [Logical clocks and causal ordering](../radar/2026-09-29/logical-clocks-and-causal-ordering.md) | A Lamport clock increments locally and advances beyond a received timestamp. |
| [Memory management and garbage collection](../radar/2026-09-29/memory-management-and-garbage-collection.md) | Allocation creates objects in stack or heap storage under language/runtime rules. |
| [Microservices](../radar/2026-09-29/microservices.md) | Each service owns its implementation and usually its authoritative data. |
| [Model Context Protocol (MCP)](../radar/2026-09-29/model-context-protocol-mcp.md) | A host manages clients that negotiate protocol capabilities with servers. |
| [Model routing and AI gateways](../radar/2026-09-29/model-routing-and-ai-gateways.md) | The gateway authenticates callers, enforces approved providers and budgets, then forwards under a routing policy. |
| [Modular monolith](../radar/2026-09-29/modular-monolith.md) | Modules expose intentional interfaces and own implementation details. |
| [Multi-region architecture](../radar/2026-09-29/multi-region-architecture.md) | Define which region owns writes and how data is replicated. |
| [MVCC and vacuuming](../radar/2026-09-29/mvcc-and-vacuuming.md) | An update generally creates a new tuple and marks the previous version obsolete. |
| [OAuth 2.0 and OpenID Connect](../radar/2026-09-29/oauth-2-0-and-openid-connect.md) | In a modern authorization-code flow, the client redirects to an authorization server, obtains a code and exchanges it with PKCE protection under the applicable client rules. |
| [Object storage](../radar/2026-09-29/object-storage.md) | Clients upload or retrieve objects by key. |
| [OpenAPI](../radar/2026-09-29/openapi.md) | A document defines paths, operations, parameters, request bodies and response schemas. |
| [OpenTelemetry](../radar/2026-09-29/opentelemetry.md) | Instrumentation creates spans and measurements, SDKs batch and export them, and collectors receive, process and route telemetry. |
| [OS scheduling and resource isolation](../radar/2026-09-29/os-scheduling-and-resource-isolation.md) | The scheduler selects runnable threads, considering policy and fairness. |
| [Platform engineering](../radar/2026-09-29/platform-engineering.md) | Identify recurring user needs, provide a supported path and collect feedback. |
| [Policy as code](../radar/2026-09-29/policy-as-code.md) | A caller supplies facts—such as a deployment manifest and environment—to a policy engine. |
| [Post-quantum cryptography readiness](../radar/2026-09-29/post-quantum-cryptography-readiness.md) | Inventory where public-key encryption, key agreement and signatures appear, then map confidentiality lifetimes and dependencies. |
| [PostgreSQL](../radar/2026-09-29/postgresql.md) | Backends execute statements against MVCC snapshots. |
| [Premature microservice decomposition](../radar/2026-09-29/premature-microservice-decomposition.md) | The anti-pattern often begins by splitting tables or CRUD endpoints into services. |
| [Progressive delivery](../radar/2026-09-29/progressive-delivery.md) | Deploy a candidate, route an initial cohort and compare user-impact and operational signals against an appropriate baseline. |
| [Prometheus](../radar/2026-09-29/prometheus.md) | Targets expose samples; Prometheus stores them with timestamps and label sets. |
| [Protocol Buffers](../radar/2026-09-29/protocol-buffers.md) | A `.proto` declaration assigns each field a unique number and type. |
| [Python](../radar/2026-09-29/python.md) | Python executes code through its implementation's runtime. |
| [Queues and load shedding](../radar/2026-09-29/queues-and-load-shedding.md) | Admission control accepts work only within capacity and deadline budgets. |
| [RAG architecture](../radar/2026-09-29/rag-architecture.md) | Ingest documents with source identity and access metadata, split them into meaningful chunks and index lexical or vector representations. |
| [Redis](../radar/2026-09-29/redis.md) | Clients send commands to the responsible server. |
| [Regular expressions](../radar/2026-09-29/regular-expressions.md) | A matcher interprets or compiles a pattern and searches input. |
| [Repository instructions for coding agents](../radar/2026-09-29/repository-instructions-for-coding-agents.md) | Keep instructions close to the code they govern and explain command entry points, architecture constraints and common pitfalls. |
| [Saga pattern](../radar/2026-09-29/saga-pattern.md) | An orchestrator persists each step and its outcome, or services choreograph progress through events. |
| [Secrets management](../radar/2026-09-29/secrets-management.md) | A workload authenticates using an appropriate identity and reads only its required secrets. |
| [Secure-by-design development](../radar/2026-09-29/secure-by-design-development.md) | Identify sensitive assets and trust boundaries, choose enforceable defaults, and verify them throughout implementation. |
| [Serverless platforms](../radar/2026-09-29/serverless-platforms.md) | Requests or events invoke managed instances. |
| [Service discovery](../radar/2026-09-29/service-discovery.md) | Servers or controllers register endpoints; clients query DNS or a registry, or connect through a stable proxy. |
| [Service mesh by default](../radar/2026-09-29/service-mesh-by-default.md) | Evaluate concrete needs: workload authentication, consistent policy or specialized traffic management. |
| [Service mesh](../radar/2026-09-29/service-mesh.md) | A control plane distributes identities and routing policy to the data plane. |
| [SLIs, SLOs and error budgets](../radar/2026-09-29/slis-slos-and-error-budgets.md) | Define eligible events and what counts as good, measure their ratio or distribution, and choose an objective with product stakeholders. |
| [Software supply-chain security](../radar/2026-09-29/software-supply-chain-security.md) | Pin and review inputs, isolate builds, record provenance and publish immutable artifacts. |
| [SQL](../radar/2026-09-29/sql.md) | Logical processing derives rows through `FROM` and joins, filters them with `WHERE`, groups them, applies `HAVING`, and computes output and ordering. |
| [Static analysis and linters](../radar/2026-09-29/static-analysis-and-linters.md) | An analyzer parses an abstract syntax tree (AST), resolves symbols and types, and applies rules. |
| [Strangler Fig migration](../radar/2026-09-29/strangler-fig-migration.md) | Introduce a seam such as an API facade, route or event boundary. |
| [Stream processing](../radar/2026-09-29/stream-processing.md) | Operators consume events, partition them by key and update state. |
| [Temporal](../radar/2026-09-29/temporal.md) | Workflow code makes deterministic decisions and schedules activities, timers or child workflows. |
| [Terraform / OpenTofu](../radar/2026-09-29/terraform-opentofu.md) | Providers expose resource operations. |
| [Threat modeling](../radar/2026-09-29/threat-modeling.md) | Draw the data flow and identify who controls each input and component. |
| [Transactional Outbox](../radar/2026-09-29/transactional-outbox.md) | The application inserts the business row and outbox row together. |
| [Trunk-based development](../radar/2026-09-29/trunk-based-development.md) | Engineers make bounded changes, run relevant checks and merge quickly through the team's review process. |
| [Unbounded retries and queues](../radar/2026-09-29/unbounded-retries-and-queues.md) | An arrival rate above processing capacity increases backlog continuously. |
| [Vector databases](../radar/2026-09-29/vector-databases.md) | An embedding model maps items into vectors. |
| [WebAssembly](../radar/2026-09-29/webassembly.md) | A runtime validates and compiles or interprets a module. |
| [WebSockets and Server-Sent Events](../radar/2026-09-29/websockets-and-server-sent-events.md) | WebSocket peers exchange framed messages after establishing a connection. |
| [Workflow orchestration](../radar/2026-09-29/workflow-orchestration.md) | A workflow records state transitions or execution history before advancing. |
| [Zero trust architecture](../radar/2026-09-29/zero-trust-architecture.md) | A policy decision considers authenticated subject, target resource and available context, while enforcement points apply the decision. |

## Narrow corrections — 2

| Blip | Correction |
| --- | --- |
| [Idempotency](../radar/2026-09-29/idempotency.md) | Clarified the crash gap between an external provider call and the local result, durable operation claims, and rejecting key reuse with a different payload. |
| [TCP and connection lifecycle](../radar/2026-09-29/tcp-and-connection-lifecycle.md) | Corrected the Go client/transport distinction: new clients may share DefaultTransport; repeatedly creating independent transports prevents pool reuse. |

## Preserved unchanged — 21

| Blip | Reason to preserve |
| --- | --- |
| [API design and evolution](../radar/2026-09-29/api-design-and-evolution.md) | Defines behavioral contracts, pagination and compatibility; the cursor migration example is specific and useful. |
| [Caching strategies](../radar/2026-09-29/caching-strategies.md) | Explains cache-aside, TTL, invalidation and stampede protection with a concrete expiry incident. |
| [Circuit breakers](../radar/2026-09-29/circuit-breakers.md) | Correctly explains states, health signals and interaction with retries, using a provider-outage example. |
| [Concurrency control](../radar/2026-09-29/concurrency-control.md) | Distinguishes optimistic and pessimistic control and demonstrates an atomic claim invariant. |
| [Connection pooling](../radar/2026-09-29/connection-pooling.md) | Explains acquisition, lifetime and fleet-wide connection budgets with concrete capacity arithmetic. |
| [Data modeling and access patterns](../radar/2026-09-29/data-modeling-and-access-patterns.md) | Connects cardinality, constraints and storage choices to actual read/write paths. |
| [Database indexing and query optimization](../radar/2026-09-29/database-indexing-and-query-optimization.md) | Explains selectivity, plan estimates and correlated statistics with a relevant performance regression. |
| [Database transactions and isolation](../radar/2026-09-29/database-transactions-and-isolation.md) | Describes PostgreSQL isolation and transaction scope accurately and uses an inventory race to teach atomic updates. |
| [Delivery semantics](../radar/2026-09-29/delivery-semantics.md) | Names acknowledgement crash windows and separates broker delivery from business effects. |
| [Distributed systems fundamentals](../radar/2026-09-29/distributed-systems-fundamentals.md) | Teaches partial failure and uncertain outcomes, with an outbox example tied to the actual dual-write problem. |
| [DNS](../radar/2026-09-29/dns.md) | Explains recursive/authoritative resolution, TTL and caching with a realistic endpoint migration. |
| [Event-driven architecture](../radar/2026-09-29/event-driven-architecture.md) | Distinguishes events from commands and explains publication, ordering and consumer recovery. |
| [Horizontal partitioning and sharding](../radar/2026-09-29/horizontal-partitioning-and-sharding.md) | Explains placement, hot tenants, fan-out and ownership migration without promising free scalability. |
| [Load balancing](../radar/2026-09-29/load-balancing.md) | Covers L4/L7 selection, health and draining with a rollout-specific failure example. |
| [Make / task runners](../radar/2026-09-29/make-task-runners.md) | Already covers targets, prerequisites, timestamp builds, phony targets, shell behavior, pinning and local/CI parity. |
| [Managed relational databases](../radar/2026-09-29/managed-relational-databases.md) | Already covers control-plane responsibilities, PITR, HA, replicas, maintenance, connections and provider constraints. |
| [Observability](../radar/2026-09-29/observability.md) | Links metrics/logs/traces to concrete diagnostic questions and a database latency investigation. |
| [Rate limiting and backpressure](../radar/2026-09-29/rate-limiting-and-backpressure.md) | Explains token/concurrency limits, bounded queues and fairness against a fixed provider capacity. |
| [Replication and consistency models](../radar/2026-09-29/replication-and-consistency-models.md) | Connects replication topology with lag, read-your-writes, quorum caveats and failover loss. |
| [Timeouts, retries and jitter](../radar/2026-09-29/timeouts-retries-and-jitter.md) | Explains deadline budgets, retry amplification and duplicate safety with a latency-budget example. |
| [TLS and PKI](../radar/2026-09-29/tls-and-pki.md) | Accurately teaches certificate identity, trust chains, rotation and termination with a CA-bundle failure. |
