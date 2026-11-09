import { RateLimitedError } from "@/lib/errors";

const hits = new Map<string, number[]>();

/**
 * Best-effort, per-instance limiter for paid model calls. It resets on deploy
 * and is not shared between serverless instances.
 */
export function enforceRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): void {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    throw new RateLimitedError();
  }
  recent.push(now);
  hits.set(key, recent);
}
