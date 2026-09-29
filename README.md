# Senior Backend Engineering Radar

## 🌐 Live Radar

**https://ammorteza.github.io/senior-backend-engineering-radar/**

A public, opinionated learning radar for senior backend engineers growing toward Staff-level systems and architecture depth.

The interactive site is generated with **AOE Technology Radar**. Each blip lives as Markdown under `radar/<release-date>/`, allowing richer explanations and revision history over time.

## Quadrants

- **Techniques** — distributed systems, architecture, reliability, security, data design, delivery and AI-assisted engineering.
- **Platforms** — runtime, cloud, databases, messaging, orchestration and data platforms.
- **Tools** — observability, infrastructure, CI/CD, profiling, testing, debugging and engineering productivity.
- **Languages & Frameworks** — languages, protocols, schemas and core backend ecosystems.

## Rings

- **Adopt** — production-level competency is expected or strongly recommended.
- **Trial** — gain hands-on experience.
- **Assess** — understand the problem, architecture, failure modes and trade-offs.
- **Caution** — do not make this a default choice without a concrete reason.

## 20-minute daily routine

1. **5 min — Define it:** What problem does this blip solve?
2. **5 min — Understand it:** How does it work?
3. **5 min — Trade-offs:** When should you not use it? What are the alternatives?
4. **5 min — Apply it:** Explain a production scenario, failure mode or design decision involving it.

## Run locally

```bash
npm install
npm run dev
```

## Data

AOE-native entries are under `radar/`. `radar.csv` and `radar.json` remain as portable exports.

## GitHub Pages

The deployment workflow builds `build/` and publishes it to GitHub Pages. Expected URL:

`https://ammorteza.github.io/senior-backend-engineering-radar/`

## Contributing

Suggestions and ring changes are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).
