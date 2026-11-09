# ClearPath

ClearPath turns eviction notices, court papers, and government letters into plain language, clear next steps, and deadlines. Built for the Code for Humanity hackathon.

> ClearPath explains documents. It is not legal advice.

## Try it

Open `/demo` to see a sample eviction notice explained in English and Spanish. It needs no account or API key.

## Features

- Add a phone photo, a PDF, or pasted text; Claude reads the file
- A plain-language summary at a 6th-grade reading level, in 12 languages
- Next steps in priority order, each with what happens if you miss it
- Deadlines that keep the notice's wording and never guess a date
- Download deadlines to your calendar, with reminders
- Read explanations out loud
- Ask follow-up questions answered only from your document
- Links to free legal aid
- Delete a document and its file at any time

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

   In Supabase, add `<your site>/auth/callback` to Auth > URL Configuration > Redirect URLs. The private `documents` storage bucket is created automatically on the first upload.

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
| `npm test` | Unit and route tests. Set `TEST_DATABASE_URL` to a throwaway Postgres (e.g. from `npx prisma dev`) to also run the database tests |
| `npm run db:migrate` | Create and apply a migration in development |
| `npm run db:deploy` | Apply pending migrations |
| `npm run db:studio` | Open Prisma Studio |

## Privacy and tenant isolation

Users must never see each other's documents. This is enforced in three layers:

1. **Data layer.** All queries go through `src/lib/data/`, where every function takes the signed-in user's id and filters on it. Someone else's record is reported as "not found".
2. **Lint rule.** ESLint blocks importing the raw Prisma client outside `src/lib/`.
3. **Database.** Action items reference their document by `(documentId, userId)`, so Postgres rejects a row whose owner differs from its document's owner. Row Level Security is enabled with no policies, which closes Supabase's public Data API to these tables.
