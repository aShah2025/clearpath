import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
  ]),
  {
    // Tenant isolation: only src/lib may touch the raw Prisma client. Routes
    // and components go through the user-scoped functions in src/lib/data/.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/db",
              message: "Use the tenant-scoped functions in @/lib/data/ instead.",
            },
          ],
          patterns: [
            {
              group: ["@/generated/prisma/*", "!@/generated/prisma/enums"],
              allowTypeImports: true,
              message: "Import Prisma types only; query through @/lib/data/.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
