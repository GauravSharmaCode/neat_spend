# Contributing to NeatSpend Microservices

Thank you for considering contributing! This project is designed as a modular, multi-repo microservices ecosystem. Here’s how to get started:

## 🧑‍💻 Local Development

- Clone the repo (all packages and services are in one monorepo).
- For local utility packages (e.g., logger), use `npm link` to connect them to your services.
- Run `npm install` in each service/package before starting development.

## 🧰 Monorepo Tooling (Optional/Future)

- You can use tools like [pnpm workspaces](https://pnpm.io/workspaces), [turborepo](https://turbo.build/), or [lerna](https://lerna.js.org/) for advanced monorepo management.
- For now, local linking (`npm link`) is recommended for utilities.

## 🧪 Testing

- Each package/service should have its own `/test/` folder and run tests via `npm test`.
- Use Jest or your preferred Node.js test runner.

## 📦 Publishing/Linking

- For local development, use `npm link` as described in each package’s README.
- For public/private NPM, update the `package.json` version and run `npm publish`.

## 📝 Code Style

- Use Prettier and ESLint for formatting and linting.
- Keep code modular and DRY.

## 🚢 Docker & Cloud Run (Future)

- Each service/package can have its own `Dockerfile` for containerization.
- See `/infra/cloud-run-configs/` for deployment templates (or add your own).

## 🤝 PRs & Issues

- Open issues for bugs or feature requests.
- Submit pull requests with clear descriptions and reference related issues.

## 📚 Docs

- Each package/service must have a `README.md` with usage and API docs.
- For complex flows, add docs in `/docs/` or `/service/docs/` as needed.

---

Happy hacking! 🚀
