# link-shortener

A link shortener built with [Next.js](https://nextjs.org/) (App Router), [Prisma](https://www.prisma.io/) on MongoDB and [Tailwind CSS](https://tailwindcss.com/).

## Stack

- Next.js 16 + React 19 (App Router, Turbopack)
- Prisma 6 with MongoDB (Prisma 7 does not support MongoDB yet)
- Tailwind CSS 4
- TypeScript 6, ESLint 9 (flat config)

## Getting Started

Requires Node.js 20.19+ and Yarn 1.

Create a `.env` file:

```bash
DATABASE_URL="mongodb+srv://..."
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="..."
```

Then install dependencies (this also generates the Prisma client) and start the dev server:

```bash
yarn
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `yarn dev` – start the dev server
- `yarn build` – production build
- `yarn start` – serve the production build
- `yarn lint` – run ESLint
- `yarn typecheck` – run the TypeScript compiler

## How it works

- `src/app/page.tsx` – the UI for creating short links
- `src/app/api/add-url` – `POST { url, slug?, blocked? }` creates a short link
- `src/app/api/get-url/[slug]` – `GET` looks up a short link
- `src/proxy.ts` – resolves `/<slug>` and redirects to the target URL. Links created with
  "Restrict from malicious IPs" redirect visitors from blocklisted IPs (`src/lib/blocked-ip-ranges.ts`)
  away, and send everyone else through `/captcha` first.
