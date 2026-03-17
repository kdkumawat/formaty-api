import type { Env } from "../types/env";
import { CONFIG } from "../config";
import { json, error } from "../utils/response";
import { validatePlaygroundPayload } from "../utils/validate";
import { checkRateLimit } from "../utils/rateLimit";

export async function handlePostPlayground(
  request: Request,
  env: Env
): Promise<Response> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const allowed = await checkRateLimit(ip, env);
  if (!allowed) {
    return error("Rate limit exceeded", 429);
  }

  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    return error("Content-Type must be application/json", 415);
  }

  const contentLength = request.headers.get("Content-Length");
  if (contentLength && parseInt(contentLength, 10) > CONFIG.MAX_BODY_SIZE) {
    return error("Payload too large", 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON", 400);
  }

  const result = validatePlaygroundPayload(body, CONFIG.MAX_BODY_SIZE);
  if (!result.ok) {
    return error(result.error, 400);
  }

  const id = crypto.randomUUID();
  const key = `playground:${id}`;
  const value = JSON.stringify(result.data);

  await env.PLAYGROUND_KV.put(key, value, {
    expirationTtl: CONFIG.TTL_SECONDS,
  });

  return json({ id }, 201);
}

export async function handleGetPlayground(
  id: string,
  env: Env
): Promise<Response> {
  if (!id || id.length > 64) {
    return error("Invalid id", 400);
  }

  const key = `playground:${id}`;
  const value = await env.PLAYGROUND_KV.get(key);

  if (value === null) {
    return error("Not found", 404);
  }

  let data: unknown;
  try {
    data = JSON.parse(value);
  } catch {
    return error("Invalid stored data", 500);
  }

  return json(data);
}

export async function handlePutPlayground(
  id: string,
  request: Request,
  env: Env
): Promise<Response> {
  if (!id || id.length > 64) {
    return error("Invalid id", 400);
  }

  const key = `playground:${id}`;
  const existing = await env.PLAYGROUND_KV.get(key);
  if (existing === null) {
    return error("Not found", 404);
  }

  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    return error("Content-Type must be application/json", 415);
  }

  const contentLength = request.headers.get("Content-Length");
  if (contentLength && parseInt(contentLength, 10) > CONFIG.MAX_BODY_SIZE) {
    return error("Payload too large", 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON", 400);
  }

  const result = validatePlaygroundPayload(body, CONFIG.MAX_BODY_SIZE);
  if (!result.ok) {
    return error(result.error, 400);
  }

  const value = JSON.stringify(result.data);
  await env.PLAYGROUND_KV.put(key, value, {
    expirationTtl: CONFIG.TTL_SECONDS,
  });

  return json({ ok: true });
}

export async function handleDeletePlayground(id: string, env: Env): Promise<Response> {
  if (!id || id.length > 64) {
    return error("Invalid id", 400);
  }

  const key = `playground:${id}`;
  await env.PLAYGROUND_KV.delete(key);
  return json({ ok: true });
}
