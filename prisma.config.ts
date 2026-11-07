import "dotenv/config";
import { defineConfig } from "prisma/config";

// The CLI (migrate, studio) uses the direct connection; the app runtime uses
// the pooled DATABASE_URL via the driver adapter in src/lib/db.ts.
// `prisma generate` needs no database, so a missing DIRECT_URL is tolerated
// here (fresh clones, CI); database commands fail loudly without it.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? "",
  },
});
