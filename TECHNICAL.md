# formaty-api — Technical Documentation

## Architecture

- **Runtime**: Cloudflare Workers (V8 isolate, edge-only)
- **Storage**: KV (simulated locally by Wrangler dev)
- **Routing**: Manual, no framework

## Rate Limiting

- Fixed window (60s), max 10 requests per IP
- Key: `rate_limit:{ip}`

## Tradeoffs

- **KV**: Eventually consistent
