# Senior Backend Engineering Radar

An opinionated, public learning radar for senior backend engineers.

> What should a senior backend engineer be able to use deeply, practice next, understand architecturally, or deliberately avoid?

This project is compatible with Thoughtworks **Build Your Own Radar (BYOR)**.

## Quadrants

- **Techniques** — distributed systems, architecture, reliability, security, data design, delivery and AI-assisted engineering.
- **Platforms** — runtime, cloud, databases, messaging, orchestration and data platforms.
- **Tools** — observability, infrastructure, CI/CD, profiling, testing, debugging and engineering productivity.
- **Languages & Frameworks** — languages, protocols, schemas and core backend ecosystems.

## Rings

- **Adopt** — production-level competency is expected or strongly recommended. Apply it, reason about trade-offs and diagnose failures.
- **Trial** — gain hands-on experience before deciding whether it belongs in your regular toolkit.
- **Assess** — understand the problem, architecture, failure modes and trade-offs; hands-on expertise is optional until needed.
- **Hold** — a deliberate caution: do not make this a default choice without a concrete reason.

## 20-minute daily routine

1. **5 min — Define it:** What problem does this blip solve?
2. **5 min — Understand it:** How does it work?
3. **5 min — Trade-offs:** When should you not use it? What are the alternatives?
4. **5 min — Apply it:** Explain a production scenario, failure mode or design decision involving it.

Large domains such as PostgreSQL, Kubernetes and distributed systems are intentionally revisited at progressively deeper layers.

## Suggested learning order

Start with **Adopt / Techniques**, then Adopt items in Platforms, Tools and Languages. Move into Trial items related to your current work, and use Assess for architectural breadth. Hold items are design cautions rather than a study backlog.

## Build the radar

The source is [`radar.csv`](./radar.csv) and follows the BYOR schema:

```
name,ring,quadrant,isNew,description
```

Use this raw CSV URL with Thoughtworks Build Your Own Radar:

```
https://raw.githubusercontent.com/ammorteza/senior-backend-engineering-radar/master/radar.csv
```

## Scope

This radar targets engineers responsible for production backend systems and Senior-to-Staff growth. It emphasizes durable systems knowledge: distributed systems, databases, networking and protocols, reliability, security, cloud/platform engineering and operational excellence.

AI-assisted engineering, agent skills, RAG and MCP are included where backend engineers increasingly need architectural literacy, but they do not replace core systems knowledge.

This is a learning map, not a certification checklist. Company, domain and system context always matter.

## Contributing

Suggestions and ring changes are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).
