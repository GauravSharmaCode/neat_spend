# NeatSpend — Initial Issues & Roadmap

## 🛠 Core Services

- [x] [API] Setup User CRUD via Prisma
- [x] [API] Add logging middleware and global error handler
- [x] [API] Add healthcheck route
- [ ] [SMS Worker] Ingest messages (mocked source)
- [ ] [SMS Worker] Integrate SMS Parser
- [ ] [AI Service] Basic Gemini API wrapper
- [ ] [AI Service] Generate insights from sample transactions

## 🔐 Auth & Security

- [ ] Setup Firebase Auth client + backend verification
- [x] Add JWT middleware to API routes
- [x] Restrict endpoints to authenticated users


## 🧰 Utility Packages (to be extracted as npm packages/repos)

- [ ] [Logger] Export as `@gauravsharmacode/neat-logger` npm package/repo
- [ ] [Auth Verifier] Export as `@gauravsharmacode/auth-verifier` npm package/repo
- [ ] [Error Handler] Export as `@gauravsharmacode/error-handler` npm package/repo
- [ ] [DB Utils] Export as `@gauravsharmacode/db-utils` npm package/repo (if shared DB logic exists)
- [ ] [Validation] Export as `@gauravsharmacode/validation` npm package/repo (if using shared schemas)
- [ ] [SMS Parser] Export as `@gauravsharmacode/sms-parser` npm package/repo
- [ ] [PubSub Handler] Export as `@gauravsharmacode/pubsub-utils` npm package/repo

## 🌐 Frontend

- [ ] [Web] Setup basic Next.js app with Firebase Auth
- [ ] [Web] Dashboard UI with expenses list & sync button
- [ ] [Mobile] Setup React Native + Firebase login
- [ ] [Mobile] Sync button and local transaction history


## 🚀 DevOps & Infra

- [x] Add Dockerfiles for all services
- [x] Create Cloud Run YAMLs for services
- [ ] Setup pub/sub topics on GCP
- [ ] Setup Firestore + NeonDB schema


## 📦 Dev Experience

- [x] Setup ESLint + Prettier in root
- [x] Setup Codespaces with full environment
- [x] Setup .env config system
- [ ] Add project-wide TypeScript (optional)

---

> Utility packages above should be moved to their own repositories and published to npm.  
> All microservices should import these as dependencies, not copy code.

> Copy-paste these as GitHub Issues, or use this file as a project board reference. Refine, split, or assign as you go!
