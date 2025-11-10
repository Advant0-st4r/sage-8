// Very small in-memory rate limiter suitable for simple serverless
// usage in front of endpoints. Not distributed — for production
// use a shared store like Redis.

const buckets = new Map();

export function rateLimit(key, { tokens = 60, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const bucket = buckets.get(key) || { tokens, last: now };

  // Refill based on elapsed time
  const elapsed = now - (bucket.last || now);
  const refill = (elapsed / windowMs) * tokens;
  bucket.tokens = Math.min(tokens, (bucket.tokens || tokens) + refill);
  bucket.last = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    buckets.set(key, bucket);
    return { allowed: true, remaining: bucket.tokens };
  }

  buckets.set(key, bucket);
  return { allowed: false, remaining: bucket.tokens };
}

export function clearRateLimits() {
  buckets.clear();
}
