# Kinja waitlist

A public page where someone asks to join Kinja, and a private list at `/list`.

Joining the waitlist does not create a Kinja account.

## Run it

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000. The list is at http://localhost:3000/list.

Set `ADMIN_PASSWORD` and `SESSION_SECRET` in `.env.local`. The local password shipped for this machine is `kinja-waitlist-admin`. Change it before you deploy.

## What is stored

Each request keeps a name, email, business, how they source, and an optional note. Entries live in `.data/waitlist.db` (SQLite, git-ignored). Export them as CSV from the list page.

## Checks

```bash
pnpm test
pnpm exec tsc --noEmit
pnpm lint
```
