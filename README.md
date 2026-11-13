# link-shortener

A link shortener built with [Next.js](https://nextjs.org/) (App Router), [Prisma](https://www.prisma.io/) on MongoDB and [Tailwind CSS](https://tailwindcss.com/).

## Stack

- Next.js 16 + React 19 (App Router, Turbopack)
- Prisma 6 with MongoDB (Prisma 7 does not support MongoDB yet)
- Clerk for accounts
- Tailwind CSS 4
- TypeScript 6, ESLint 9 (flat config)

## Getting Started

Requires Node.js 20.19+ and Yarn 1.

Create a `.env` file:

```bash
DATABASE_URL="mongodb+srv://..."
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="..."
TYPESAFE_API_KEY="..."
# From https://dashboard.clerk.com (API keys). In development you can leave these
# out and Clerk runs in keyless mode with temporary keys.
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
# Optional: set to true to stop counting clicks on every link
DISABLE_CLICK_TRACKING="false"
```

Then install dependencies (this also generates the Prisma client), sync the
database indexes and start the dev server:

```bash
yarn
yarn prisma db push
yarn dev
```

### Local database

To develop against a local MongoDB instead, use Docker
(Prisma needs a replica set, which `compose.yaml` sets up):

```bash
DATABASE_URL="mongodb://localhost:27017/link-shortener?directConnection=true"
```

```bash
yarn db:up    # start MongoDB and sync the Prisma schema
yarn db:down  # stop it (data stays in the mongo-data volume)
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `yarn dev` – start the dev server
- `yarn build` – production build
- `yarn start` – serve the production build
- `yarn lint` – run ESLint
- `yarn typecheck` – run the TypeScript compiler
- `yarn db:up` / `yarn db:down` – start / stop the local MongoDB

## How it works

- `src/app/page.tsx` – the UI for creating short links
- `src/app/api/add-url` – `POST { url, slug?, blocked? }` creates a short link. If the
  request is signed in, the link belongs to that account. Taken custom slugs return `409`.
- `src/app/api/get-url/[slug]` – `GET` looks up a short link
- `src/app/dashboard` – signed-in users list their links, change the slug or destination,
  toggle the IP restriction and click counting, and delete links
- `src/proxy.ts` – resolves `/<slug>` and redirects to the target URL; every other path goes
  through Clerk. Links created with "Restrict from malicious IPs" redirect visitors from
  blocklisted IPs (`src/lib/blocked-ip-ranges.ts`) away, and send everyone else through
  `/captcha` first. Clicks on links that have an owner are counted after the redirect is sent.
- `src/lib/slug.ts` – slug rules, including the reserved slugs that the app's own pages use
