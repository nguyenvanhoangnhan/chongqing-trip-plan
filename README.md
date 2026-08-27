# Chongqing trip

A privacy-conscious trip planner for organizing an itinerary, opening map
directions, shortlisting gifts, and tracking individual budgets.

[Open the deployed app](https://chongqing-plan.vercel.app)

## Features

- Authenticated itinerary and gift-planning views
- Baidu Maps and Amap place links
- Individual gift lists and budget tracking
- Protected delivery for private itinerary and image assets
- Optimistic concurrency protection for saved selections

## Stack

- Next.js App Router and React
- Auth.js
- Vercel Blob
- Zustand
- Vitest and Testing Library

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill the placeholders in `.env.local` before starting the app. Credentials,
private itinerary data, generated exports, and image binaries are intentionally
excluded from the repository.

## Private itinerary

The itinerary document lives only in Vercel Blob and never enters the
repository. `pull` writes it to the ignored `tmp/`, and `push` refuses a
document the audit rejects.

```bash
npm run itinerary:pull
npm run itinerary:validate
npm run itinerary:push tmp/itinerary.json
```

## Map links

Neither Baidu nor Amap returns an error for a request it cannot serve: it
redirects to its own home page, so a link that looks right in the markup can
still be dead. This follows every link both maps can be given.

```bash
npm run maps:check
```

Links to `www.amap.com` are reported as unverifiable because that site draws
its route in the browser, so an HTTP check cannot tell a real route from a
blank map. Open those by hand.

## Quality checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```
