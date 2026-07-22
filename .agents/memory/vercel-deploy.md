---
name: Vercel deployment setup
description: How the api-server is deployed to Vercel and what issues were fixed
---

# Vercel Deployment for bias-api-server

**Why:** Vercel's @vercel/node compiled api/index.ts using node16 moduleResolution (requires explicit .js extensions). Our code uses bundler resolution without extensions → TypeScript errors.

**Fix:** Pre-build with esbuild, serve pre-built bundle from api/index.mjs.

## Key details

- Vercel project: `bias-api-server` (prj_ARWLVA2WFVY2sI2VGZnyYn3H6FrU)
- Team: team_lbYfkpvH4X4xg3jFQrhntJvU
- Production URL: https://bias-api-server.vercel.app
- GitHub repo: hamo23bias-coder/bias (main branch)

## Build approach

- `vercel.json` buildCommand runs esbuild → produces `artifacts/api-server/dist/app.mjs`
- `api/index.mjs` imports the pre-built Express app (NOT api/index.ts which caused TS errors)
- `includeFiles: "artifacts/api-server/dist/**"` bundles pino workers too

## drizzle-zod removal

**Why:** drizzle-zod@0.8.3 uses zod v4 internally but workspace catalog pins zod@^3.25.76. The zod/v4 compat import caused TypeScript type conflicts.

**Fix:** Replaced `createInsertSchema` + `z.infer` with `InferInsertModel<typeof table>` from drizzle-orm in all lib/db/src/schema/*.ts files. drizzle-zod removed from lib/db/package.json.

**How to apply:** Never re-add drizzle-zod unless upgrading zod to v4 in catalog first.
