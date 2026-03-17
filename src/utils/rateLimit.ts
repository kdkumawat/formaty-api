import type { Env } from "../types/env";
import { CONFIG } from "../config";

export async function checkRateLimit(ip: string, env: Env): Promise<boolean> {
  const key = `rate_limit:${ip}`;
  const kv = env.RATE_LIMIT_KV;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - CONFIG.RATE_LIMIT_WINDOW;

  const raw = await kv.get(key);
  let count = 0;
  let lastReset = now;

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { count: number; windowStart: number };
      if (parsed.windowStart >= windowStart) {
        count = parsed.count;
        lastReset = parsed.windowStart;
      }
    } catch {
      // invalid entry, treat as fresh
    }
  }

  if (count >= CONFIG.RATE_LIMIT_MAX) {
    return false;
  }

  const newCount = count + 1;
  const ttl = CONFIG.RATE_LIMIT_WINDOW + 60;
  await kv.put(key, JSON.stringify({ count: newCount, windowStart: lastReset }), {
    expirationTtl: ttl,
  });

  return true;
}
