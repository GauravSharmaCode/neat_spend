# NeatSpend — Microservices & Utilities Monorepo

> Modular, cloud-native personal finance tracker. All core services and reusable utilities are managed in a single repository, but each utility is structured as its own package for maximum reusability and clarity.

---

## 🧭 Project Overview

- **Goal:** Unified, AI-powered personal finance tracking
- **Architecture:** Microservices (Cloud Run) + Utility Packages (multi-repo style, single repo)
- **Dev Strategy:** Docker, Codespaces, local linking for utilities

---

## 📦 Repository Structure

```
neatspend/
├── neatspend-logger/           # Reusable logger utility (npm link or local import)
├── neatspend-auth-verifier/    # Firebase JWT verification utility
├── neatspend-sms-parser/       # SMS → transaction parser
├── neatspend-pubsub-handler/   # Pub/Sub event handler utils
├── services/
│   ├── neatspend-api/          # REST API + Prisma
│   ├── sms-sync-worker/        # Ingestion + parsing
│   ├── ai-insight-service/     # Gemini interaction
│   ├── shared-utils/           # Common libs
├── apps/
│   ├── web/                    # Next.js frontend
│   └── mobile/                 # React Native app
├── infra/
│   └── cloud-run-configs/      # Optional YAMLs for deploys
├── docker-compose.yml          # Local orchestration
├── .devcontainer/              # Codespaces support
├── CONTRIBUTING.md             # Dev & collab guide
└── README.md                   # This file
```

---

## 🔗 Local Linking for Utilities

To use a utility package (e.g., logger) in a service:

```sh
cd neatspend-logger
npm link
cd ../services/neatspend-api
npm link neatspend-logger
```

Then in your code:

```js
const { logWithMeta } = require("neatspend-logger");
```

---

## 📚 Documentation

- Each utility/service has its own `README.md` for usage and API docs.
- See `CONTRIBUTING.md` for setup, linking, and contribution guidelines.

---

## 🚀 Why This Structure?

- **Reusability:** Utilities can be plugged into any Node.js project.
- **Clarity:** Each package is versioned and documented.
- **Scalability:** Easy to split into true multi-repo or publish to npm in the future.

---

## 📝 Quick Start

1. Clone this repo
2. Run `npm install` in each service/package you want to use
3. Use `npm link` for local utility packages as above
4. See each package's `README.md` for usage

---

## License

MIT
