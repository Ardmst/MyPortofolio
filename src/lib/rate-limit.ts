import "server-only";

/**
 * Small fixed-window attempt limiter, kept in process memory.
 *
 * It is deliberately simple: no dependency and no store. On a serverless host
 * each warm instance has its own counters, so treat it as a brake on guessing
 * and flooding, not as a guarantee. A deployment that needs a hard limit
 * should put one in front of the app (platform firewall / WAF).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxKeys = 2000,
  ) {}

  private live(key: string, now: number): Bucket | null {
    const bucket = this.buckets.get(key);
    if (!bucket) return null;
    if (bucket.resetAt <= now) {
      this.buckets.delete(key);
      return null;
    }
    return bucket;
  }

  /** Seconds until `key` may try again; 0 when it is not blocked. */
  retryAfter(key: string, now = Date.now()): number {
    const bucket = this.live(key, now);
    if (!bucket || bucket.count < this.limit) return 0;
    return Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  }

  /** Records one attempt for `key`. */
  hit(key: string, now = Date.now()): void {
    const bucket = this.live(key, now);
    if (bucket) {
      bucket.count += 1;
      return;
    }

    if (this.buckets.size >= this.maxKeys) this.prune(now);
    this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }

  /** Drops expired entries, then the oldest ones, so memory stays bounded. */
  private prune(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
    while (this.buckets.size >= this.maxKeys) {
      const oldest = this.buckets.keys().next();
      if (oldest.done) break;
      this.buckets.delete(oldest.value);
    }
  }
}

/**
 * Best available client address. Hosting platforms set `x-forwarded-for`
 * themselves; when the app is reached directly the header can be spoofed,
 * which is why callers also keep one global bucket.
 */
export function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const direct = request.headers.get("x-real-ip")?.trim();
  return (forwarded || direct || "unknown").slice(0, 64);
}
