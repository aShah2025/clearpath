# ClearPath

ClearPath turns eviction notices, court papers, and government letters into plain language, clear next steps, and deadlines. Built for the Code for Humanity hackathon.

> ClearPath explains documents. It is not legal advice.

## Stack

- Next.js 16 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4 and shadcn/ui tokens
- Prisma 7 on Supabase Postgres
- Supabase Auth
- Claude (Anthropic SDK) for document analysis

## Getting started

1. Install dependencies (this also generates the Prisma client):

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` (Prisma CLI) and `.env.local` (Next.js), then fill in your Supabase and Anthropic values.

3. Apply the database migrations:

   ```bash
   npm run db:deploy
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create and apply a migration in development |
| `npm run db:deploy` | Apply pending migrations |
| `npm run db:studio` | Open Prisma Studio |

## Privacy and tenant isolation

Users must never see each other's documents. This is enforced in three layers:

1. **Data layer.** All queries go through `src/lib/data/`, where every function takes the signed-in user's id and filters on it. Someone else's record is reported as "not found".
2. **Lint rule.** ESLint blocks importing the raw Prisma client outside `src/lib/`.
3. **Database.** Action items reference their document by `(documentId, userId)`, so Postgres rejects a row whose owner differs from its document's owner. Row Level Security is enabled with no policies, which closes Supabase's public Data API to these tables.
