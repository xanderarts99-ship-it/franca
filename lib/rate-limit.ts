import { LRUCache } from "lru-cache";

type RateLimitOptions = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval ?? 500,
    ttl: options.interval ?? 60_000,
  });

  return {
    check: (limit: number, token: string): { success: boolean; remaining: number } => {
      const now = Date.now();
      const windowStart = now - (options.interval ?? 60_000);

      const tokenCount = tokenCache.get(token) ?? [];
      const requestsInWindow = tokenCount.filter((time) => time > windowStart);

      if (requestsInWindow.length >= limit) {
        return { success: false, remaining: 0 };
      }

      requestsInWindow.push(now);
      tokenCache.set(token, requestsInWindow);

      return { success: true, remaining: limit - requestsInWindow.length };
    },
  };
}

export const loginLimiter = rateLimit({
  interval: 15 * 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export const bookingLimiter = rateLimit({
  interval: 60 * 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export const reviewLimiter = rateLimit({
  interval: 60 * 60 * 1000,
  uniqueTokenPerInterval: 500,
});
