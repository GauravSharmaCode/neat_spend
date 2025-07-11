# NeatSpend — Initial Issues & Roadmap

## 🛠 Core Services

- [ ] [API] Setup User CRUD via Prisma
- [ ] [API] Add logging middleware and global error handler
- [ ] [API] Add healthcheck route
- [ ] [SMS Worker] Ingest messages (mocked source)
- [ ] [SMS Worker] Integrate SMS Parser
- [ ] [AI Service] Basic Gemini API wrapper
- [ ] [AI Service] Generate insights from sample transactions

## 🔐 Auth & Security

- [ ] Setup Firebase Auth client + backend verification
- [ ] Add JWT middleware to API routes
- [ ] Restrict endpoints to authenticated users

## 🧰 Utility Packages

- [ ] [Logger] Add log levels + persistent transport (file/Firestore)
- [ ] [Auth Verifier] Verify Firebase token & extract UID
- [ ] [SMS Parser] Support Axis, SBI, Paytm, CRED format
- [ ] [PubSub Handler] Create base handler with retry logic

## 🌐 Frontend

- [ ] [Web] Setup basic Next.js app with Firebase Auth
- [ ] [Web] Dashboard UI with expenses list & sync button
- [ ] [Mobile] Setup React Native + Firebase login
- [ ] [Mobile] Sync button and local transaction history

## 🚀 DevOps & Infra

- [ ] Add Dockerfiles for all services
- [ ] Create Cloud Run YAMLs for services
- [ ] Setup pub/sub topics on GCP
- [ ] Setup Firestore + NeonDB schema

## 📦 Dev Experience

- [ ] Setup ESLint + Prettier in root
- [ ] Setup Codespaces with full environment
- [ ] Setup .env config system
- [ ] Add project-wide TypeScript (optional)

---

> Copy-paste these as GitHub Issues, or use this file as a project board reference. Refine, split, or assign as you go!
