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

## Quality checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```
