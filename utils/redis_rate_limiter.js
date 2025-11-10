import Redis from 'ioredis';

let client;

export function getRedisClient(url) {
  if (!client) {
    client = new Redis(url);
  }
  return client;
}

// Simple token bucket implemented in Redis using INCR/EXPIRE
export async function redisRateLimit(key, { tokens = 60, windowSec = 60 } = {}, redisUrl) {
  if (!redisUrl) throw new Error('REDIS_URL not provided');
  const r = getRedisClient(redisUrl);
  const k = `rl:${key}`;

  const current = await r.get(k);
  if (current === null) {
    // initialize bucket with tokens-1 and set expiry
    await r.set(k, tokens - 1, 'EX', windowSec);
    return { allowed: true, remaining: tokens - 1 };
  }

  const val = await r.decr(k);
  if (val >= 0) {
    return { allowed: true, remaining: Number(val) };
  }

  return { allowed: false, remaining: Number(val) };
}
