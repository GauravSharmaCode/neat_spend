# NeatSpend API - Prisma Database Schema

This directory contains the Prisma schema and migration files for the NeatSpend API Gateway service.

## Schema Overview

The API Gateway service uses Prisma ORM to manage its database schema. The schema is defined in `schema.prisma`.

## Current Models

```prisma
// Example model - will be implemented as needed
model ApiKey {
  id        String   @id @default(uuid())
  key       String   @unique
  name      String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Migrations

Database migrations are managed through Prisma Migrate:

```bash
# Create a new migration
npx prisma migrate dev --name migration-name

# Apply migrations in production
npx prisma migrate deploy
```

## Development Workflow

1. Modify `schema.prisma` to update your data model
2. Run `npx prisma migrate dev --name describe-changes` to create a migration
3. Run `npx prisma generate` to update the Prisma Client

## Database Connection

The database connection is configured through the `DATABASE_URL` environment variable:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neatspend_api?schema=public"
```

## Prisma Studio

You can use Prisma Studio to view and edit your database:

```bash
npx prisma studio
```

## Best Practices

- Always create migrations for schema changes
- Use descriptive names for migrations
- Keep migrations small and focused
- Test migrations thoroughly before applying to production