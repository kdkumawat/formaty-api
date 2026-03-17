# formaty-api

Production-ready backend for formaty playground sharing. Built with Cloudflare Workers, TypeScript, and KV storage.

**Location**: Same level as `formaty` (e.g. `POC/formaty-api`)

## Overview

- **POST /playground** — Save playground state, returns `{ id }`
- **PUT /playground/:id** — Update existing playground
- **GET /playground/:id** — Load shared playground
- Rate limiting on POST (10 req/min per IP)
- 1MB max body size, 7-day TTL

## Setup

### 1. Install

```bash
cd formaty-api
npm install
```

### 2. Local Development

```bash
npm run dev
```

Wrangler simulates KV locally. API at `http://localhost:8787`.

### 3. Create KV Namespaces (for deploy)

```bash
wrangler login
wrangler kv:namespace create PLAYGROUND_KV
wrangler kv:namespace create RATE_LIMIT_KV
```

Copy the `id` values into `wrangler.toml`.

### 4. Deploy

```bash
npm run deploy
```

## API Usage

### Save playground

```bash
curl -X POST https://YOUR_WORKER_URL/playground \
  -H "Content-Type: application/json" \
  -d '{"input":"{}","output":"{}","format":"json","options":{}}'
```

Response: `{"id":"abc-123-uuid"}`

### Load playground

```bash
curl https://YOUR_WORKER_URL/playground/abc-123-uuid
```

## Frontend Integration

Set in formaty `.env.local`:

```
FORMATY_API_URL=https://formaty-api.YOUR_SUBDOMAIN.workers.dev
```

Share URL format: `/playground?id={id}`
