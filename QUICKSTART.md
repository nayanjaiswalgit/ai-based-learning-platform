# Quick Start Guide - Windows

This guide will help you get the AI Learning Platform running on your Windows machine quickly.

## Prerequisites

Before you begin, ensure you have:

- Node.js 20.18.0+ ([Download](https://nodejs.org/))
- pnpm 9.15.1+ (`npm install -g pnpm@9.15.1`)
- Git ([Download](https://git-scm.com/))

## Step 1: Install Dependencies

```powershell
pnpm install
```

**Expected warnings you can ignore:**
- `node-pty` build failure (already made optional)
- Deprecation warnings

## Step 2: Generate Prisma Client (CRITICAL!)

```powershell
cd packages\database
pnpm prisma generate
cd ..\..
```

## Step 3: Set Up Environment

```powershell
copy .env.example .env
```

Edit `.env` with minimal config:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_learning"
JWT_SECRET="change-this-in-production"
```

## Step 4: Start Development

```powershell
pnpm dev
```

If "turbo is not recognized":
```powershell
pnpm exec turbo run dev --concurrency=20
```

## Access

- Frontend: http://localhost:3000
- API: http://localhost:4000

## Troubleshooting

**TypeScript errors about Prisma?**
→ Run `pnpm --filter @ai-learning/database prisma generate`

**Missing API keys?**
→ Set `ENABLE_AI_FEATURES=false` in `.env`

For detailed help, see [WINDOWS_SETUP.md](./WINDOWS_SETUP.md)
